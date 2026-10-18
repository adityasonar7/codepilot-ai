"""
Authentication API endpoints.
Handles GitHub OAuth flow, demo sign-in, and session management with PostgreSQL persistence.
"""

from datetime import datetime, timezone
import uuid
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    exchange_github_code,
    get_current_user,
)
from app.db.database import get_db
from app.models.user import User
from app.models.review import Review
from app.models.repository import Repository

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory user store as secondary fast cache
USERS_STORE: dict[int, User] = {}
USERS_BY_ID: dict[str, User] = {}


@router.post("/github")
async def github_auth(request: dict, db: AsyncSession = Depends(get_db)):
    """
    Exchange a GitHub OAuth authorization code for JWT tokens.
    Persists or updates the user profile in PostgreSQL.
    """
    code = request.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    github_user = await exchange_github_code(code)
    if not github_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to authenticate with GitHub. Invalid or expired code.",
        )

    github_id = github_user["github_id"]

    # Check if user exists in PostgreSQL
    stmt = select(User).where(User.github_id == github_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if user:
        user.username = github_user["username"]
        user.name = github_user.get("name")
        user.email = github_user.get("email")
        user.avatar_url = github_user.get("avatar_url")
        user.github_access_token = github_user["github_access_token"]
        user.last_login_at = datetime.now(timezone.utc)
    else:
        user = User(
            id=uuid.uuid4(),
            github_id=github_id,
            username=github_user["username"],
            name=github_user.get("name") or github_user["username"],
            email=github_user.get("email"),
            avatar_url=github_user.get("avatar_url"),
            bio=github_user.get("bio"),
            company=github_user.get("company"),
            location=github_user.get("location"),
            github_access_token=github_user["github_access_token"],
            role="user",
            plan="free",
            review_count=0,
            last_login_at=datetime.now(timezone.utc),
        )
        db.add(user)

    await db.commit()
    await db.refresh(user)

    user_id_str = str(user.id)
    USERS_STORE[github_id] = user
    USERS_BY_ID[user_id_str] = user

    logger.info(f"User authenticated: {user.username} (id={user.id})")

    token_data = {"sub": user_id_str, "username": user.username}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


@router.post("/demo")
async def demo_auth(db: AsyncSession = Depends(get_db)):
    """
    Instant demo/guest login.
    Enables anyone to immediately explore and use CodePilot AI without GitHub OAuth setup.
    """
    demo_github_id = 99999999
    stmt = select(User).where(User.github_id == demo_github_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        user = User(
            id=uuid.uuid4(),
            github_id=demo_github_id,
            username="demo_engineer",
            name="Demo Engineer",
            email="demo@codepilot.ai",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
            bio="Exploring CodePilot AI automated code reviews and vulnerability analysis.",
            company="CodePilot Team",
            location="San Francisco, CA",
            github_access_token=None,
            role="admin",
            plan="pro",
            review_count=0,
            last_login_at=datetime.now(timezone.utc),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    user_id_str = str(user.id)
    USERS_STORE[demo_github_id] = user
    USERS_BY_ID[user_id_str] = user

    token_data = {"sub": user_id_str, "username": user.username}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user_id_str,
            "username": user.username,
            "name": user.name,
            "email": user.email,
        }
    }


@router.get("/me")
async def read_current_user(
    current_user: User = Depends(get_current_user),
):
    """Get the current authenticated user's profile."""
    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "name": current_user.name or current_user.username,
        "email": current_user.email,
        "avatar_url": current_user.avatar_url,
        "bio": current_user.bio,
        "company": current_user.company,
        "location": current_user.location,
        "role": current_user.role,
        "plan": current_user.plan,
        "review_count": current_user.review_count,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }


@router.post("/reset")
async def reset_account_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Reset user's account reviews and metrics back to 0.
    """
    # Delete all reviews for this user
    del_stmt = delete(Review).where(Review.user_id == current_user.id)
    await db.execute(del_stmt)

    # Reset user's review count
    current_user.review_count = 0
    await db.commit()

    return {"message": "Account data successfully reset.", "review_count": 0}


@router.post("/logout")
async def logout():
    """
    Logout the current user.
    """
    return {"message": "Successfully logged out. Discard your tokens."}
