from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.poll import PollCreate, PollResponse
from app.schemas.result import PollResultResponse
from app.services.poll_service import (
    close_poll,
    create_poll,
    get_all_polls,
    get_poll_by_id,
)
from app.services.vote_service import get_poll_results

router = APIRouter(prefix="/polls", tags=["Polls"])


@router.post("", response_model=PollResponse, status_code=status.HTTP_201_CREATED)
def create_new_poll(
    poll_data: PollCreate,
    db: Session = Depends(get_db),
) -> PollResponse:
    """Create a new poll with 2 to 10 choices."""
    return create_poll(db=db, poll_data=poll_data)


@router.get("", response_model=List[PollResponse])
def list_all_polls(
    db: Session = Depends(get_db),
) -> List[PollResponse]:
    """Retrieve all polls with their options, ordered newest first."""
    return list(get_all_polls(db=db))


@router.get("/{poll_id}", response_model=PollResponse)
def get_poll_details(
    poll_id: int,
    db: Session = Depends(get_db),
) -> PollResponse:
    """Retrieve details of a single poll by ID."""
    poll = get_poll_by_id(db=db, poll_id=poll_id)
    if not poll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Poll with ID {poll_id} not found.",
        )
    return poll


@router.patch("/{poll_id}/close", response_model=PollResponse)
def close_existing_poll(
    poll_id: int,
    db: Session = Depends(get_db),
) -> PollResponse:
    """Close an active poll to prevent further voting."""
    poll = close_poll(db=db, poll_id=poll_id)
    if not poll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Poll with ID {poll_id} not found.",
        )
    return poll


@router.get("/{poll_id}/results", response_model=PollResultResponse)
def get_poll_statistics(
    poll_id: int,
    db: Session = Depends(get_db),
) -> PollResultResponse:
    """Retrieve voting tallies and percentage metrics for a poll."""
    results = get_poll_results(db=db, poll_id=poll_id)
    if not results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Poll with ID {poll_id} not found.",
        )
    return results
