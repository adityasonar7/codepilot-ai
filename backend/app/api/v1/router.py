"""
API v1 router aggregator.
Mounts all endpoint routers under the /api/v1 prefix.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, github, reviews, webhooks

# Create the main v1 router
api_router = APIRouter(prefix="/api/v1")

# Mount endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(github.router, prefix="/github", tags=["github"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
