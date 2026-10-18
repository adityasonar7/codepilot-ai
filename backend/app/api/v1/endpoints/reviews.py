"""
API endpoints for AI Code Reviews.
Persists reviews to PostgreSQL and provides real-time user-scoped statistics.
"""

import uuid
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.db.database import get_db
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewRequest, ReviewResponse, ReviewStatsResponse, ReviewIssue
from app.services.ai_reviewer import AIReviewerService
from app.core.security import get_current_user

router = APIRouter()
ai_reviewer_service = AIReviewerService()


def _model_to_response(rev: Review) -> ReviewResponse:
    raw_issues = rev.issues or []
    issues_list = []
    for item in raw_issues:
        issues_list.append(ReviewIssue(
            id=item.get("id", str(uuid.uuid4())),
            file_path=item.get("file_path", rev.repo_name),
            line_number=item.get("line_number", 1),
            severity=item.get("severity", "medium"),
            category=item.get("category", "maintainability"),
            title=item.get("title", "Review Finding"),
            description=item.get("description", ""),
            suggestion=item.get("suggestion", ""),
            snippet=item.get("snippet"),
        ))

    return ReviewResponse(
        id=str(rev.id),
        repo_name=rev.repo_name,
        branch=rev.branch,
        score=rev.score,
        total_issues=rev.total_issues,
        critical_count=rev.critical_count,
        high_count=rev.high_count,
        medium_count=rev.medium_count,
        low_count=rev.low_count,
        summary=rev.summary,
        issues=issues_list,
        created_at=rev.created_at,
    )


@router.post("/run", response_model=ReviewResponse)
async def run_review(
    request: ReviewRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Trigger a real AI code review for a repository or pasted code snippet.
    Saves the review to PostgreSQL database.
    """
    try:
        review_result = await ai_reviewer_service.run_review(
            repo_name=request.repo_name or "custom-snippet",
            branch=request.branch or "main",
            github_token=getattr(current_user, "github_access_token", None),
            code_snippet=request.code_snippet,
        )

        # Save to database
        db_review = Review(
            id=uuid.UUID(review_result.id),
            user_id=current_user.id if current_user else None,
            repo_name=review_result.repo_name,
            branch=review_result.branch,
            score=review_result.score,
            total_issues=review_result.total_issues,
            critical_count=review_result.critical_count,
            high_count=review_result.high_count,
            medium_count=review_result.medium_count,
            low_count=review_result.low_count,
            summary=review_result.summary,
            issues=[issue.model_dump() for issue in review_result.issues],
            created_at=review_result.created_at,
        )
        db.add(db_review)

        # Update user's review count
        if current_user:
            current_user.review_count = (current_user.review_count or 0) + 1

        await db.commit()
        await db.refresh(db_review)

        return _model_to_response(db_review)

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to run review: {str(e)}")


@router.get("/stats", response_model=ReviewStatsResponse)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get dynamic, real-time statistics for the current user's dashboard.
    If the user has 0 reviews, returns clean zeroed state.
    """
    # Fetch all reviews for this user
    stmt = (
        select(Review)
        .where(Review.user_id == current_user.id)
        .order_by(desc(Review.created_at))
    )
    res = await db.execute(stmt)
    user_reviews = res.scalars().all()

    total_reviews = len(user_reviews)
    unique_repos = len(set(r.repo_name for r in user_reviews))
    total_issues = sum(r.total_issues for r in user_reviews)
    security_warnings = sum(r.critical_count + r.high_count for r in user_reviews)

    avg_score = round(sum(r.score for r in user_reviews) / total_reviews, 1) if total_reviews > 0 else 100.0
    time_saved_hours = round(total_reviews * 0.75)

    # Days of week breakdown
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    day_counts = {d: {"reviews": 0, "issues": 0} for d in days}
    for r in user_reviews:
        if r.created_at >= week_ago:
            day_name = r.created_at.strftime("%a")
            if day_name in day_counts:
                day_counts[day_name]["reviews"] += 1
                day_counts[day_name]["issues"] += r.total_issues

    weekly_data = [
        {"day": d, "reviews": day_counts[d]["reviews"], "issues": day_counts[d]["issues"]}
        for d in days
    ]

    # Severity distribution
    crit = sum(r.critical_count for r in user_reviews)
    high = sum(r.high_count for r in user_reviews)
    med = sum(r.medium_count for r in user_reviews)
    low = sum(r.low_count for r in user_reviews)

    severity_distribution = [
        {"level": "Critical", "count": crit, "color": "bg-rose-500", "textColor": "text-rose-400"},
        {"level": "High", "count": high, "color": "bg-amber-500", "textColor": "text-amber-400"},
        {"level": "Medium", "count": med, "color": "bg-blue-500", "textColor": "text-blue-400"},
        {"level": "Low", "count": low, "color": "bg-emerald-500", "textColor": "text-emerald-400"},
    ]

    recent_responses = [_model_to_response(r) for r in user_reviews[:5]]

    return ReviewStatsResponse(
        repositories_reviewed=unique_repos,
        reviews_generated=total_reviews,
        issues_found=total_issues,
        security_warnings=security_warnings,
        average_score=avg_score,
        review_time_saved_hours=time_saved_hours,
        weekly_data=weekly_data,
        recent_reviews=recent_responses,
        severity_distribution=severity_distribution,
    )


@router.get("/history", response_model=List[ReviewResponse])
async def get_review_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the history of all completed AI reviews for the current user."""
    stmt = (
        select(Review)
        .where(Review.user_id == current_user.id)
        .order_by(desc(Review.created_at))
    )
    res = await db.execute(stmt)
    reviews = res.scalars().all()
    return [_model_to_response(r) for r in reviews]


@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review_details(
    review_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get the details of a specific AI review."""
    try:
        uid = uuid.UUID(review_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid review ID format")

    stmt = select(Review).where(Review.id == uid)
    res = await db.execute(stmt)
    review = res.scalar_one_or_none()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    return _model_to_response(review)
