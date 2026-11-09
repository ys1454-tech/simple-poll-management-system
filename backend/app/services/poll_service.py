from typing import Optional, Sequence
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.poll import Poll
from app.models.poll_option import PollOption
from app.schemas.poll import PollCreate


def create_poll(db: Session, poll_data: PollCreate) -> Poll:
    """
    Creates a new poll with its options in a single atomic transaction.
    Rolls back automatically if an error occurs.
    """
    try:
        # Create parent poll record with default "open" status
        new_poll = Poll(
            question=poll_data.question,
            status="open",
        )
        db.add(new_poll)
        db.flush()  # Generates new_poll.id for child options

        # Create child option records
        for opt_text in poll_data.options:
            option = PollOption(
                poll_id=new_poll.id,
                option_text=opt_text,
            )
            db.add(option)

        db.commit()
        db.refresh(new_poll)
        return new_poll
    except Exception:
        db.rollback()
        raise


def get_all_polls(db: Session) -> Sequence[Poll]:
    """
    Retrieves all polls with their options eagerly loaded,
    ordered newest first.
    """
    stmt = (
        select(Poll)
        .options(selectinload(Poll.options))
        .order_by(Poll.created_at.desc(), Poll.id.desc())
    )
    return db.scalars(stmt).all()


def get_poll_by_id(db: Session, poll_id: int) -> Optional[Poll]:
    """
    Retrieves a single poll by ID with its options eagerly loaded.
    Returns None if the poll does not exist.
    """
    stmt = (
        select(Poll)
        .options(selectinload(Poll.options))
        .where(Poll.id == poll_id)
    )
    return db.scalars(stmt).first()


def close_poll(db: Session, poll_id: int) -> Optional[Poll]:
    """
    Closes a poll by setting its status to 'closed'.
    Preserves all existing options and votes.
    Returns None if the poll does not exist.
    """
    poll = get_poll_by_id(db, poll_id)
    if not poll:
        return None

    try:
        poll.status = "closed"
        db.commit()
        db.refresh(poll)
        return poll
    except Exception:
        db.rollback()
        raise
