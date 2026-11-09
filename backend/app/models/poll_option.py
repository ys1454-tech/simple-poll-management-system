from typing import TYPE_CHECKING, List
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.poll import Poll
    from app.models.vote import Vote


class PollOption(Base):
    __tablename__ = "poll_options"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    poll_id: Mapped[int] = mapped_column(
        ForeignKey("polls.id", ondelete="CASCADE"),
        nullable=False,
    )
    option_text: Mapped[str] = mapped_column(String(255), nullable=False)

    # Relationships
    # Each option belongs to one parent poll.
    poll: Mapped["Poll"] = relationship(
        "Poll",
        back_populates="options",
    )

    # Each option can receive multiple votes.
    votes: Mapped[List["Vote"]] = relationship(
        "Vote",
        back_populates="option",
    )
