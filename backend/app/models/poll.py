from datetime import datetime, timezone
from typing import TYPE_CHECKING, List
from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.poll_option import PollOption
    from app.models.vote import Vote


def get_utc_now() -> datetime:
    """Returns current UTC timestamp with timezone."""
    return datetime.now(timezone.utc)


class Poll(Base):
    __tablename__ = "polls"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    question: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
    )

    # Relationships
    # One poll has multiple options; deleting a poll cascades and deletes its options.
    options: Mapped[List["PollOption"]] = relationship(
        "PollOption",
        back_populates="poll",
        cascade="all, delete-orphan",
        order_by="PollOption.id",
    )

    # One poll has multiple votes; closing or archiving a poll preserves vote history.
    votes: Mapped[List["Vote"]] = relationship(
        "Vote",
        back_populates="poll",
    )
