"""
Pydantic schemas for Repository.
"""

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from typing import Optional


# Shared properties
class RepositoryBase(BaseModel):
    github_repo_id: int
    name: str
    full_name: str
    description: Optional[str] = None
    is_private: bool = False
    language: Optional[str] = None
    default_branch: str = "main"
    is_connected: bool = True


# Properties to receive on creation
class RepositoryCreate(RepositoryBase):
    pass


# Properties to receive on update
class RepositoryUpdate(BaseModel):
    is_connected: Optional[bool] = None
    last_scanned_at: Optional[datetime] = None


# Properties shared by models stored in DB
class RepositoryInDBBase(RepositoryBase):
    id: UUID
    user_id: UUID
    last_scanned_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Properties to return to client
class RepositoryResponse(RepositoryInDBBase):
    pass


# Properties properties stored in DB
class RepositoryInDB(RepositoryInDBBase):
    pass


# Schema for GitHub API responses (Mock or Real)
class GitHubRepoResponse(BaseModel):
    id: int
    name: str
    full_name: str
    description: Optional[str] = None
    private: bool
    language: Optional[str] = None
    default_branch: str
    html_url: str
    stargazers_count: int
    updated_at: str
    is_connected: bool = False
