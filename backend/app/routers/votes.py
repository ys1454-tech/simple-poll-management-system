from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.vote import VoteCreate, VoteResponse
from app.services.exceptions import (
    DuplicateVoteError,
    OptionNotFoundError,
    PollClosedError,
    PollNotFoundError,
)
from app.services.vote_service import cast_vote

router = APIRouter(prefix="/polls", tags=["Votes"])


@router.post("/{poll_id}/vote", response_model=VoteResponse, status_code=status.HTTP_201_CREATED)
def submit_vote(
    poll_id: int,
    vote_data: VoteCreate,
    db: Session = Depends(get_db),
) -> VoteResponse:
    """Cast a student vote on a specific option in a poll."""
    try:
        return cast_vote(db=db, poll_id=poll_id, vote_data=vote_data)
    except PollNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except PollClosedError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except OptionNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except DuplicateVoteError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        # Prevent leakage of raw database errors to client
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing your vote.",
        ) from exc
