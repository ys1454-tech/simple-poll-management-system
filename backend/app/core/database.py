from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

# Create lazy-connecting SQLAlchemy engine
# pool_pre_ping=True tests connections for liveness upon checkout to handle idle timeouts gracefully
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Thread-local database session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    """SQLAlchemy 2.x Declarative Base class for all ORM models."""
    pass


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a database session per request
    and guarantees it is closed when the request lifecycle ends.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
