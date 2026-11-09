from datetime import datetime
from typing import List
from pydantic import BaseModel, ConfigDict, Field, field_validator


class PollCreate(BaseModel):
    """Schema for creating a new poll with options."""

    question: str = Field(
        ...,
        min_length=5,
        max_length=500,
        description="The poll question prompt.",
    )
    options: List[str] = Field(
        ...,
        min_length=2,
        max_length=10,
        description="List of between 2 and 10 choices for the poll.",
    )

    @field_validator("question")
    @classmethod
    def validate_question(cls, v: str) -> str:
        trimmed = v.strip()
        if len(trimmed) < 5:
            raise ValueError("Question must contain at least 5 characters after trimming whitespace.")
        if len(trimmed) > 500:
            raise ValueError("Question must not exceed 500 characters.")
        return trimmed

    @field_validator("options")
    @classmethod
    def validate_options(cls, options: List[str]) -> List[str]:
        if len(options) < 2:
            raise ValueError("A poll must contain at least 2 options.")
        if len(options) > 10:
            raise ValueError("A poll cannot contain more than 10 options.")

        cleaned_options: List[str] = []
        seen_normalized: set[str] = set()

        for idx, opt in enumerate(options, start=1):
            if not isinstance(opt, str):
                raise ValueError(f"Option #{idx} must be a valid text string.")

            trimmed = opt.strip()
            if len(trimmed) < 1:
                raise ValueError(f"Option #{idx} cannot be empty after trimming whitespace.")
            if len(trimmed) > 255:
                raise ValueError(f"Option #{idx} must not exceed 255 characters.")

            # Case-insensitive duplicate check ignoring surrounding whitespace
            normalized = trimmed.casefold()
            if normalized in seen_normalized:
                raise ValueError(f"Duplicate option detected: '{trimmed}' (options must be unique).")

            seen_normalized.add(normalized)
            cleaned_options.append(trimmed)

        return cleaned_options


class PollOptionResponse(BaseModel):
    """Schema representing an option in poll response data."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    poll_id: int
    option_text: str


class PollResponse(BaseModel):
    """Schema representing a poll with its options."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    question: str
    status: str
    created_at: datetime
    options: List[PollOptionResponse] = []
