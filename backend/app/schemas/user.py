"""
Pydantic schemas for User data validation and serialization.
These schemas define the shape of API request/response bodies.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema with common fields."""
    username: str
    email: Optional[str] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a new user (from GitHub OAuth)."""
    github_id: int
    github_access_token: str


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None


class UserResponse(UserBase):
    """Schema for user data in API responses."""
    id: UUID
    github_id: int
    role: str
    plan: str
    is_active: bool
    review_count: int
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserProfileResponse(BaseModel):
    """Extended profile response with stats."""
    user: UserResponse
    stats: dict = Field(default_factory=dict)


# ── Auth Schemas ─────────────────────────────────────────────────

class GitHubAuthRequest(BaseModel):
    """Request schema for GitHub OAuth code exchange."""
    code: str


class TokenResponse(BaseModel):
    """JWT token pair response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    """Request schema for token refresh."""
    refresh_token: str


class AuthStatusResponse(BaseModel):
    """Response for auth status check."""
    authenticated: bool
    user: Optional[UserResponse] = None
