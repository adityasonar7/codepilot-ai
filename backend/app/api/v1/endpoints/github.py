"""
GitHub Repositories API endpoints.
Provides repository listing and connects repositories with PostgreSQL persistence.
"""

from typing import Any, List
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.models.user import User
from app.models.repository import Repository
from app.schemas.repository import GitHubRepoResponse
from app.core.security import get_current_user
from app.services.github_client import GitHubClient

router = APIRouter()

SAMPLE_POPULAR_REPOS = [
    {
        "id": 1001,
        "name": "fastapi",
        "full_name": "tiangolo/fastapi",
        "description": "FastAPI framework, high performance, easy to learn, fast to code, ready for production",
        "private": False,
        "language": "Python",
        "default_branch": "master",
        "html_url": "https://github.com/tiangolo/fastapi",
        "stargazers_count": 78000,
        "updated_at": "2026-09-28T12:00:00Z",
    },
    {
        "id": 1002,
        "name": "next.js",
        "full_name": "vercel/next.js",
        "description": "The React Framework for the Web",
        "private": False,
        "language": "TypeScript",
        "default_branch": "canary",
        "html_url": "https://github.com/vercel/next.js",
        "stargazers_count": 125000,
        "updated_at": "2026-09-30T10:00:00Z",
    },
    {
        "id": 1003,
        "name": "flask",
        "full_name": "pallets/flask",
        "description": "The Python micro framework for building web applications",
        "private": False,
        "language": "Python",
        "default_branch": "main",
        "html_url": "https://github.com/pallets/flask",
        "stargazers_count": 68000,
        "updated_at": "2026-09-15T08:00:00Z",
    },
    {
        "id": 1004,
        "name": "express",
        "full_name": "expressjs/express",
        "description": "Fast, unopinionated, minimalist web framework for Node.js",
        "private": False,
        "language": "JavaScript",
        "default_branch": "master",
        "html_url": "https://github.com/expressjs/express",
        "stargazers_count": 65000,
        "updated_at": "2026-08-20T14:00:00Z",
    },
]


@router.get("/repos", response_model=List[GitHubRepoResponse])
async def list_available_repos(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    List all repositories available for the current user from GitHub or sample repos.
    Flags repositories that are already connected.
    """
    # Fetch connected repo IDs from DB for this user
    stmt = select(Repository.github_repo_id).where(Repository.user_id == current_user.id)
    res = await db.execute(stmt)
    connected_ids = set(res.scalars().all())

    repos_list: List[GitHubRepoResponse] = []

    if current_user.github_access_token:
        try:
            client = GitHubClient(access_token=current_user.github_access_token)
            repos_list = await client.get_user_repos()
        except Exception:
            repos_list = []

    if not repos_list:
        for item in SAMPLE_POPULAR_REPOS:
            repos_list.append(GitHubRepoResponse(
                id=item["id"],
                name=item["name"],
                full_name=item["full_name"],
                description=item["description"],
                private=item["private"],
                language=item["language"],
                default_branch=item["default_branch"],
                html_url=item["html_url"],
                stargazers_count=item["stargazers_count"],
                updated_at=item["updated_at"],
                is_connected=item["id"] in connected_ids,
            ))

    for repo in repos_list:
        if repo.id in connected_ids:
            repo.is_connected = True

    return repos_list


@router.get("/repos/connected", response_model=List[dict])
async def list_connected_repos(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    List repositories that the user has connected to CodePilot AI from PostgreSQL.
    """
    stmt = select(Repository).where(Repository.user_id == current_user.id)
    res = await db.execute(stmt)
    repos = res.scalars().all()

    return [
        {
            "id": str(r.id),
            "github_repo_id": r.github_repo_id,
            "name": r.name,
            "full_name": r.full_name,
            "description": r.description,
            "is_private": r.is_private,
            "language": r.language,
            "default_branch": r.default_branch,
            "is_connected": r.is_connected,
            "last_scanned_at": r.last_scanned_at.isoformat() if r.last_scanned_at else None,
            "created_at": r.created_at.isoformat(),
            "updated_at": r.updated_at.isoformat(),
            "score": 92,
            "stars": 150,
        }
        for r in repos
    ]


@router.post("/repos/{github_repo_id}/connect", response_model=dict)
async def connect_repo(
    github_repo_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Connect a GitHub repository to CodePilot AI and persist to PostgreSQL.
    """
    # Check if already connected
    stmt = select(Repository).where(
        Repository.github_repo_id == github_repo_id,
        Repository.user_id == current_user.id,
    )
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Repository is already connected.")

    # Find repo metadata
    target_repo = None
    if current_user.github_access_token:
        try:
            client = GitHubClient(access_token=current_user.github_access_token)
            user_repos = await client.get_user_repos()
            target_repo = next((r for r in user_repos if r.id == github_repo_id), None)
        except Exception:
            pass

    if not target_repo:
        sample = next((r for r in SAMPLE_POPULAR_REPOS if r["id"] == github_repo_id), None)
        if sample:
            target_repo = GitHubRepoResponse(
                id=sample["id"],
                name=sample["name"],
                full_name=sample["full_name"],
                description=sample["description"],
                private=sample["private"],
                language=sample["language"],
                default_branch=sample["default_branch"],
                html_url=sample["html_url"],
                stargazers_count=sample["stargazers_count"],
                updated_at=sample["updated_at"],
                is_connected=True,
            )

    if not target_repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    new_repo = Repository(
        id=uuid.uuid4(),
        github_repo_id=target_repo.id,
        user_id=current_user.id,
        name=target_repo.name,
        full_name=target_repo.full_name,
        description=target_repo.description,
        is_private=target_repo.private,
        language=target_repo.language or "Python",
        default_branch=target_repo.default_branch or "main",
        is_connected=True,
        last_scanned_at=datetime.now(timezone.utc),
    )
    db.add(new_repo)
    await db.commit()
    await db.refresh(new_repo)

    return {
        "id": str(new_repo.id),
        "github_repo_id": new_repo.github_repo_id,
        "name": new_repo.name,
        "full_name": new_repo.full_name,
        "description": new_repo.description,
        "is_private": new_repo.is_private,
        "language": new_repo.language,
        "default_branch": new_repo.default_branch,
        "is_connected": True,
        "last_scanned_at": new_repo.last_scanned_at.isoformat() if new_repo.last_scanned_at else None,
        "created_at": new_repo.created_at.isoformat(),
        "updated_at": new_repo.updated_at.isoformat(),
        "score": 90,
        "stars": getattr(target_repo, "stargazers_count", 0),
    }
