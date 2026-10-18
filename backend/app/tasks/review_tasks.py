"""
AI Review Celery tasks.
Background tasks for processing code reviews asynchronously using Gemini AI & GitHub API.
"""

import asyncio
import logging
from typing import Dict, Any

from app.core.celery_app import celery_app
from app.services.gemini_service import GeminiService
from app.services.github_client import GitHubClient

logger = logging.getLogger(__name__)


async def _process_pr_review_async(pr_data: dict) -> Dict[str, Any]:
    """Async engine function executing PR diff retrieval, Gemini AI analysis, and comment posting."""
    repo_full_name = pr_data.get("repo_full_name", "user/repo")
    pr_number = pr_data.get("pr_number", 1)
    pr_title = pr_data.get("title", f"Pull Request #{pr_number}")
    pr_description = pr_data.get("description", "")
    access_token = pr_data.get("access_token")

    # 1. Fetch PR Diff via GitHub Client
    client = GitHubClient(access_token=access_token)
    diff_text = await client.get_pr_diff(repo_full_name, pr_number)

    # 2. Run Gemini AI Code Review Analysis
    gemini = GeminiService()
    review_result = await gemini.analyze_code_diff(
        pr_title=pr_title,
        pr_description=pr_description,
        diff_text=diff_text,
    )

    # 3. Post summary back to GitHub PR if token is valid
    if access_token:
        comment_body = f"""### 🤖 CodePilot AI Review Summary

**Overall Health Score:** `{review_result.get('score', 85)}/100`

{review_result.get('summary', 'Code review completed.')}

- **Critical:** {review_result.get('critical_count', 0)}
- **High:** {review_result.get('high_count', 0)}
- **Medium:** {review_result.get('medium_count', 0)}
- **Low:** {review_result.get('low_count', 0)}
"""
        await client.post_pr_comment(repo_full_name, pr_number, comment_body)

    return {
        "status": "completed",
        "repo": repo_full_name,
        "pr_number": pr_number,
        "review": review_result,
    }


@celery_app.task(bind=True, name="review.analyze_pr")
def analyze_pull_request(self, pr_data: dict) -> dict:
    """
    Asynchronously analyze a pull request.
    
    Args:
        pr_data: Dictionary containing PR metadata (repo_full_name, pr_number, title, etc.)
    
    Returns:
        Dictionary with review results, score, and findings.
    """
    self.update_state(state="ANALYZING", meta={"step": "Downloading diff & executing Gemini AI review..."})
    logger.info(f"Starting Celery review task for {pr_data.get('repo_full_name')} #{pr_data.get('pr_number')}")

    try:
        result = asyncio.run(_process_pr_review_async(pr_data))
        return result
    except Exception as e:
        logger.error(f"Error executing PR review task: {e}")
        return {
            "status": "failed",
            "error": str(e),
            "repo": pr_data.get("repo_full_name"),
            "pr_number": pr_data.get("pr_number"),
        }
