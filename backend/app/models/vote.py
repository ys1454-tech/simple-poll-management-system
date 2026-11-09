from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.poll import Poll
    from app.models.poll_option import PollOption


def get_utc_now() -> datetime:
    """Returns current UTC timestamp with timezone."""
    return datetime.now(timezone.utc)


class Vote(Base):
    __tablename__ = "votes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    poll_id: Mapped[int] = mapped_column(
        ForeignKey("polls.id"),
        nullable=False,
    )
    option_id: Mapped[int] = mapped_column(
        ForeignKey("poll_options.id"),
        nullable=False,
    )
    student_id: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
    )

    # Relationships
    poll: Mapped["Poll"] = relationship(
        "Poll",
        back_populates="votes",
    )

    option: Mapped["PollOption"] = relationship(
        "PollOption",
        back_populates="votes",
    )

    # Database-level unique constraint preventing duplicate voting:
    # Guarantees that a student cannot cast more than one vote for the same poll,
    # even under concurrent race conditions.
    __table_args__ = (
        UniqueConstraint("poll_id", "student_id", name="uq_poll_student_vote"),
    )
