from typing import List
from pydantic import BaseModel, Field


class PollOptionResult(BaseModel):
    """Schema representing the vote metrics for a specific option."""

    option_id: int
    option_text: str
    vote_count: int = Field(
        ...,
        ge=0,
        description="Total number of votes cast for this option.",
    )
    percentage: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Percentage of total votes (e.g. 33.33).",
    )


class PollResultResponse(BaseModel):
    """Schema representing the aggregate voting results of a poll."""

    poll_id: int
    question: str
    status: str
    total_votes: int = Field(
        ...,
        ge=0,
        description="Total number of ballots cast across all options.",
    )
    results: List[PollOptionResult] = Field(
        default_factory=list,
        description="Breakdown of votes per option.",
    )
