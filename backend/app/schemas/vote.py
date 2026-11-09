from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator


class VoteCreate(BaseModel):
    """Schema for casting a vote on a poll option."""

    student_id: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Unique student identifier (e.g. STU12345).",
    )
    option_id: int = Field(
        ...,
        gt=0,
        description="ID of the selected option (must be a positive integer).",
    )

    @field_validator("student_id")
    @classmethod
    def validate_student_id(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Student ID cannot be empty or blank whitespace.")
        if len(trimmed) > 100:
            raise ValueError("Student ID cannot exceed 100 characters.")
        return trimmed


class VoteResponse(BaseModel):
    """Schema representing a recorded vote."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    poll_id: int
    option_id: int
    student_id: str
    created_at: datetime
