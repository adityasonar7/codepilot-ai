"""
Pydantic schemas for AI Code Reviews.
"""

from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class ReviewIssue(BaseModel):
    id: str
    file_path: str
    line_number: int
    severity: str  # critical, high, medium, low
    category: str  # security, performance, bug, style, maintainability
    title: str
    description: str
    suggestion: str
    snippet: Optional[str] = None

class ReviewRequest(BaseModel):
    repo_name: Optional[str] = "custom-snippet"
    github_repo_id: Optional[int] = None
    branch: Optional[str] = "main"
    code_snippet: Optional[str] = None
    language: Optional[str] = "python"

class ReviewResponse(BaseModel):
    id: str
    repo_name: str
    branch: str
    score: int
    total_issues: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    summary: str
    issues: List[ReviewIssue]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ReviewStatsResponse(BaseModel):
    repositories_reviewed: int
    reviews_generated: int
    issues_found: int
    security_warnings: int
    average_score: float
    review_time_saved_hours: int
    weekly_data: List[dict]
    recent_reviews: List[ReviewResponse]
    severity_distribution: List[dict]

