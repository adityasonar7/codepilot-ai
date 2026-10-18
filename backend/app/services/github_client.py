"""
GitHub API client service.
Fetches repository and pull request data from GitHub.
Uses real GitHub access tokens from OAuth.
"""

import httpx
from datetime import datetime, timezone
import logging
from typing import List, Optional
from fastapi import HTTPException

from app.core.config import settings
from app.schemas.repository import GitHubRepoResponse

logger = logging.getLogger(__name__)

class GitHubClient:
    """Client for interacting with GitHub REST API using real OAuth tokens."""
    
    def __init__(self, access_token: Optional[str] = None):
        self.base_url = "https://api.github.com"
        self.access_token = access_token
        
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
        }
        if self.access_token:
            self.headers["Authorization"] = f"token {self.access_token}"

    async def get_user_repos(self) -> List[GitHubRepoResponse]:
        """Fetch repositories for the authenticated user from GitHub."""
        if not self.access_token:
            logger.warning("No GitHub access token — cannot fetch repos")
            return []

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    f"{self.base_url}/user/repos",
                    headers=self.headers,
                    params={"sort": "updated", "per_page": 100}
                )
                response.raise_for_status()
                repos_data = response.json()
                
                result = []
                for repo in repos_data:
                    result.append(GitHubRepoResponse(
                        id=repo["id"],
                        name=repo["name"],
                        full_name=repo["full_name"],
                        description=repo.get("description"),
                        private=repo["private"],
                        language=repo.get("language"),
                        default_branch=repo["default_branch"],
                        html_url=repo["html_url"],
                        stargazers_count=repo["stargazers_count"],
                        updated_at=repo["updated_at"],
                        is_connected=False  # Will be determined in the router
                    ))
                
                logger.info(f"Fetched {len(result)} repos from GitHub")
                return result
        except httpx.HTTPStatusError as e:
            logger.error(f"GitHub API error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(status_code=500, detail="Failed to fetch repositories from GitHub")
        except Exception as e:
            logger.error(f"GitHub client error: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error while calling GitHub API")

    async def get_repo_contents(self, repo_full_name: str, path: str = "", branch: str = "main") -> list:
        """Fetch the file tree of a repository (top-level or specific path). Works for public repos without token."""
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    f"{self.base_url}/repos/{repo_full_name}/contents/{path}",
                    headers=self.headers,
                    params={"ref": branch}
                )
                if response.status_code == 200:
                    return response.json()
                logger.warning(f"Could not fetch repo contents ({response.status_code}) for {repo_full_name}")
                return []
        except Exception as e:
            logger.error(f"Error fetching repo contents: {e}")
            return []

    async def get_file_content(self, repo_full_name: str, file_path: str, branch: str = "main") -> str:
        """Fetch the raw content of a single file from GitHub. Works for public repos without token."""
        try:
            raw_headers = {**self.headers, "Accept": "application/vnd.github.v3.raw"}
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    f"{self.base_url}/repos/{repo_full_name}/contents/{file_path}",
                    headers=raw_headers,
                    params={"ref": branch}
                )
                if response.status_code == 200:
                    return response.text
                logger.warning(f"Could not fetch file content ({response.status_code}) for {file_path}")
                return ""
        except Exception as e:
            logger.error(f"Error fetching file {file_path}: {e}")
            return ""

    async def setup_webhook(self, repo_full_name: str) -> bool:
        """Set up a webhook for PR events (placeholder for now)."""
        logger.info(f"Webhook setup requested for {repo_full_name}")
        return True

    async def get_pr_diff(self, repo_full_name: str, pr_number: int) -> str:
        """Fetch code diff for a specific Pull Request."""
        if not self.access_token:
            return ""

        try:
            diff_headers = {**self.headers, "Accept": "application/vnd.github.v3.diff"}
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    f"{self.base_url}/repos/{repo_full_name}/pulls/{pr_number}",
                    headers=diff_headers,
                )
                response.raise_for_status()
                return response.text
        except Exception as e:
            logger.error(f"Error fetching PR diff from GitHub: {e}")
            return ""

    async def post_pr_comment(self, repo_full_name: str, pr_number: int, body: str) -> bool:
        """Post a summary review comment back to the GitHub PR."""
        if not self.access_token:
            return False

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{self.base_url}/repos/{repo_full_name}/issues/{pr_number}/comments",
                    headers=self.headers,
                    json={"body": body},
                )
                response.raise_for_status()
                return True
        except Exception as e:
            logger.error(f"Error posting PR comment on GitHub: {e}")
            return False
