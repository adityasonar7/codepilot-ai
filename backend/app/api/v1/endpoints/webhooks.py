"""
GitHub Webhook API endpoints.
Receives incoming GitHub webhook events for Pull Requests and dispatches Celery tasks.
"""

import logging
from typing import Any, Dict

from fastapi import APIRouter, Header, HTTPException, Request, status

from app.tasks.review_tasks import analyze_pull_request

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/github")
async def github_webhook_listener(
    request: Request,
    x_github_event: str = Header(None),
) -> Dict[str, Any]:
    """
    GitHub Webhook receiver.
    Listens for `pull_request` events and queues asynchronous Gemini AI reviews.
    """
    payload = await request.json()

    if x_github_event == "ping":
        logger.info("GitHub Webhook Ping Event received successfully.")
        return {"msg": "pong"}

    if x_github_event == "pull_request":
        action = payload.get("action")
        pr = payload.get("pull_request", {})
        repo = payload.get("repository", {})

        if action in ["opened", "synchronize", "reopened"]:
            pr_data = {
                "repo_full_name": repo.get("full_name"),
                "pr_number": pr.get("number"),
                "title": pr.get("title"),
                "description": pr.get("body", ""),
                "action": action,
            }
            logger.info(f"Received PR Webhook [{action}] for {pr_data['repo_full_name']} #{pr_data['pr_number']}. Enqueuing Celery review task.")

            # Queue task to Celery asynchronously
            task = analyze_pull_request.delay(pr_data)

            return {
                "status": "queued",
                "task_id": task.id,
                "repo": pr_data["repo_full_name"],
                "pr_number": pr_data["pr_number"],
            }

    return {"status": "ignored", "event": x_github_event}
