import logging
import os
from contextlib import asynccontextmanager
from typing import Dict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models  # Ensures all ORM models (Poll, PollOption, Vote) are registered with Base.metadata
from app.core import database
from app.core.config import settings
from app.routers import polls_router, votes_router

logger = logging.getLogger("uvicorn.info")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.
    Initializes database tables on startup using the configured database engine.
    Any database connection errors are allowed to propagate visibly.
    """
    logger.info("Initializing database tables on startup...")
    Base = database.Base
    Base.metadata.create_all(bind=database.engine)
    logger.info("Database tables initialized successfully.")
    yield


# Initialize FastAPI application with lifespan management
app = FastAPI(
    title="Simple Poll Management System",
    description="A lightweight REST API for poll creation, voting, and real-time result calculation.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS origins
# Reads from ALLOWED_ORIGINS env var or defaults to local Vite frontend ports
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.app\.github\.dev",  # Allows GitHub Codespaces forwarded browser ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
# Registered both at root (/polls) and under /api (/api/polls) to support direct calls and frontend Vite proxy
app.include_router(polls_router)
app.include_router(votes_router)
app.include_router(polls_router, prefix="/api")
app.include_router(votes_router, prefix="/api")


@app.get("/health", tags=["Health"])
def health_check() -> Dict[str, str]:
    """Health check endpoint to verify backend service readiness."""
    return {"status": "healthy", "service": "Simple Poll Management System"}
