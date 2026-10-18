"""
CodePilot AI - FastAPI Application Entry Point

This is the main FastAPI application factory that configures:
- CORS middleware for cross-origin requests
- API router mounting with versioning
- Lifespan events for startup/shutdown
- Health check and root endpoints
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.database import close_db, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup (DB initialization) and shutdown (connection cleanup).
    """
    # Startup
    if settings.DEBUG:
        try:
            await init_db()
        except Exception as e:
            print(f"Warning: Failed to init DB, continuing without it. Error: {e}")
    yield
    # Shutdown
    await close_db()


def create_app() -> FastAPI:
    """
    Application factory that creates and configures the FastAPI instance.
    
    Returns:
        Configured FastAPI application.
    """
    app = FastAPI(
        title=settings.APP_NAME,
        description=settings.APP_DESCRIPTION,
        version=settings.APP_VERSION,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS Middleware ──────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Mount API Router ─────────────────────────────────────────
    app.include_router(api_router)

    # ── Health Check ─────────────────────────────────────────────
    @app.get("/health", tags=["Health"])
    async def health_check():
        """Health check endpoint for monitoring and load balancers."""
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
        }

    @app.get("/", tags=["Root"])
    async def root():
        """Root endpoint with API information."""
        return {
            "app": settings.APP_NAME,
            "tagline": "Review Code Smarter.",
            "version": settings.APP_VERSION,
            "docs": "/api/docs",
        }

    return app


# Create the application instance
app = create_app()
