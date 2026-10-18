"""
Security utilities for JWT token management and GitHub OAuth flow.
Handles token creation, verification, and the OAuth dance with GitHub.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
import logging

import httpx
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings

logger = logging.getLogger(__name__)

# Password hashing context (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for extracting Bearer tokens from requests
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/github")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token with the given data payload.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """
    Create a JWT refresh token with a longer expiration.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_token(token: str, token_type: str = "access") -> Optional[dict]:
    """
    Verify and decode a JWT token.
    """
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        if payload.get("type") != token_type:
            return None
        return payload
    except JWTError:
        return None


async def exchange_github_code(code: str) -> Optional[dict]:
    """
    Exchange a GitHub OAuth authorization code for an access token,
    then fetch the user's GitHub profile and email.
    
    This is the REAL GitHub OAuth exchange. No more mock fallback.
    """
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        logger.error("GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET not set!")
        return None

    async with httpx.AsyncClient() as client:
        # Step 1: Exchange code for access token
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.GITHUB_REDIRECT_URI,
            },
            headers={"Accept": "application/json"},
        )

        if token_response.status_code != 200:
            logger.error(f"GitHub token exchange failed: {token_response.text}")
            return None

        token_data = token_response.json()
        access_token = token_data.get("access_token")

        if not access_token:
            logger.error(f"No access_token in GitHub response: {token_data}")
            return None

        logger.info("Successfully exchanged code for GitHub access token")

        # Step 2: Fetch user profile
        user_response = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json",
            },
        )

        if user_response.status_code != 200:
            logger.error(f"GitHub user fetch failed: {user_response.text}")
            return None

        user_data = user_response.json()

        # Step 3: Fetch user email (may be private)
        email_response = await client.get(
            "https://api.github.com/user/emails",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json",
            },
        )

        primary_email = None
        if email_response.status_code == 200:
            emails = email_response.json()
            primary_email = next(
                (e["email"] for e in emails if e.get("primary")), None
            )

        return {
            "github_id": user_data["id"],
            "username": user_data["login"],
            "name": user_data.get("name", user_data["login"]),
            "email": primary_email or user_data.get("email"),
            "avatar_url": user_data.get("avatar_url"),
            "bio": user_data.get("bio"),
            "company": user_data.get("company"),
            "location": user_data.get("location"),
            "github_access_token": access_token,
        }


async def get_current_user(
    token: str = Depends(oauth2_scheme),
):
    """
    Dependency that extracts the current user from the JWT token.
    Checks PostgreSQL database, then falls back to memory cache.
    """
    import uuid
    from app.db.database import async_session_factory
    from app.models.user import User
    from sqlalchemy import select

    # Decode the JWT
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # 1. Try DB lookup
    try:
        user_uuid = uuid.UUID(user_id_str)
        async with async_session_factory() as session:
            stmt = select(User).where(User.id == user_uuid)
            res = await session.execute(stmt)
            user = res.scalar_one_or_none()
            if user:
                return user
    except Exception as e:
        logger.debug(f"DB lookup failed for user: {e}")

    # 2. Look up user in the in-memory store
    from app.api.v1.endpoints.auth import USERS_BY_ID
    user = USERS_BY_ID.get(user_id_str)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User session expired. Please log in again.",
        )

    return user


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)
