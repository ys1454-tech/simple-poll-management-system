from typing import Any, Dict, Optional
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.models.poll import Poll
from app.models.poll_option import PollOption
from app.models.vote import Vote
from app.schemas.vote import VoteCreate
from app.services.exceptions import (
    DuplicateVoteError,
    OptionNotFoundError,
    PollClosedError,
    PollNotFoundError,
)


def cast_vote(db: Session, poll_id: int, vote_data: VoteCreate) -> Vote:
    """
    Submits a vote for a poll option after enforcing:
    1. Poll exists.
    2. Poll is open.
    3. Option exists and belongs to this poll.
    4. Student has not already voted in this poll.

    Under concurrent conditions, the database unique constraint
    (poll_id, student_id) guarantees no duplicate votes occur.
    """
    # 1. Verify poll existence
    poll = db.scalars(select(Poll).where(Poll.id == poll_id)).first()
    if not poll:
        raise PollNotFoundError(f"Poll with ID {poll_id} not found.")

    # 2. Check poll status
    if poll.status != "open":
        raise PollClosedError(f"Poll #{poll_id} is '{poll.status}'. Voting is not permitted.")

    # 3. Verify option exists and belongs to this poll
    option = db.scalars(
        select(PollOption).where(
            PollOption.id == vote_data.option_id,
            PollOption.poll_id == poll_id,
        )
    ).first()
    if not option:
        raise OptionNotFoundError(
            f"Option #{vote_data.option_id} does not exist for Poll #{poll_id}."
        )

    # 4. Check for existing vote by this student
    existing_vote = db.scalars(
        select(Vote).where(
            Vote.poll_id == poll_id,
            Vote.student_id == vote_data.student_id,
        )
    ).first()
    if existing_vote:
        raise DuplicateVoteError(
            f"Student '{vote_data.student_id}' has already voted in Poll #{poll_id}."
        )

    # 5. Insert new vote record
    new_vote = Vote(
        poll_id=poll_id,
        option_id=vote_data.option_id,
        student_id=vote_data.student_id,
    )
    db.add(new_vote)

    try:
        db.commit()
        db.refresh(new_vote)
        return new_vote
    except IntegrityError as exc:
        db.rollback()
        # Catch concurrent race-condition violations of uq_poll_student_vote
        err_msg = str(exc.orig) if hasattr(exc, "orig") else str(exc)
        if any(keyword in err_msg for keyword in ["uq_poll_student_vote", "Duplicate", "UNIQUE"]):
            raise DuplicateVoteError(
                f"Student '{vote_data.student_id}' has already voted in Poll #{poll_id}."
            ) from exc
        # Re-raise unrelated database integrity constraints
        raise
    except Exception:
        db.rollback()
        raise


def get_poll_results(db: Session, poll_id: int) -> Optional[Dict[str, Any]]:
    """
    Computes voting statistics and percentages for a poll.
    Includes every configured option, even if it has zero votes.
    Returns None if the poll does not exist.
    """
    poll = db.scalars(
        select(Poll)
        .options(selectinload(Poll.options))
        .where(Poll.id == poll_id)
    ).first()

    if not poll:
        return None

    # Tally votes grouped by option for this poll
    counts_query = (
        select(Vote.option_id, func.count(Vote.id).label("count"))
        .where(Vote.poll_id == poll_id)
        .group_by(Vote.option_id)
    )
    vote_counts: Dict[int, int] = dict(db.execute(counts_query).all())

    # Total votes cast in this poll
    total_votes = sum(vote_counts.values())

    # Build per-option percentage breakdown
    results = []
    for opt in poll.options:
        count = vote_counts.get(opt.id, 0)
        percentage = round((count / total_votes) * 100.0, 2) if total_votes > 0 else 0.0
        results.append(
            {
                "option_id": opt.id,
                "option_text": opt.option_text,
                "vote_count": count,
                "percentage": percentage,
            }
        )

    return {
        "poll_id": poll.id,
        "question": poll.question,
        "status": poll.status,
        "total_votes": total_votes,
        "results": results,
    }
