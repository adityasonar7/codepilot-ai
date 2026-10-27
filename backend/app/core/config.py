"""
Application configuration using Pydantic BaseSettings.
All environment variables are centralized here for type-safe access.
"""

from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator


class Settings(BaseSettings):
    """
    Global application settings loaded from environment variables.
    Uses Pydantic v2 BaseSettings for type-safe configuration.
    """

    # ── Application ──────────────────────────────────────────────
    APP_NAME: str = "CodePilot AI"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "AI-Powered GitHub Code Review Platform"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # ── Server ───────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v):
        """Accept a comma-separated string or a list for ALLOWED_ORIGINS."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # ── Database ─────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://codepilot:codepilot@localhost:5432/codepilot_db"
    DATABASE_ECHO: bool = False

    # ── Redis ────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600  # 1 hour default cache TTL

    # ── JWT Authentication ───────────────────────────────────────
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── GitHub OAuth ─────────────────────────────────────────────
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_REDIRECT_URI: str = "http://localhost:3000/api/auth/callback/github"
    GITHUB_SCOPES: str = "user:email,repo,read:org"

    # ── Gemini AI ────────────────────────────────────────────────
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # ── OpenAI (Fallback) ────────────────────────────────────────
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"

    # ── Cloudinary (Free Cloud Storage) ──────────────────────────
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # ── Celery ───────────────────────────────────────────────────
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # ── Sentry ───────────────────────────────────────────────────
    SENTRY_DSN: Optional[str] = None

    # ── Rate Limiting ────────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 60

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Singleton settings instance
settings = Settings()
