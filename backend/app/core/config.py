import os
from pathlib import Path
from dotenv import load_dotenv

# Locate and load .env from backend/ or project root
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_file = BASE_DIR / ".env"
if env_file.exists():
    load_dotenv(dotenv_path=env_file)
else:
    load_dotenv()


class Settings:
    """Application settings with development defaults matching Docker Compose."""

    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Simple Poll Management System")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api")

    # Database connection parameters (Defaults match .devcontainer/docker-compose.yml)
    DB_HOST: str = os.getenv("DB_HOST", "db")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_NAME: str = os.getenv("DB_NAME", "simple_poll_db")
    DB_USER: str = os.getenv("DB_USER", "poll_user")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "poll_dev_password")

    @property
    def DATABASE_URL(self) -> str:
        """Constructs or returns the SQLAlchemy MySQL connection URL."""
        env_url = os.getenv("DATABASE_URL")
        if env_url:
            return env_url
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    @property
    def SAFE_DATABASE_URL(self) -> str:
        """Returns the database connection URL with credentials masked for safe logging."""
        return (
            f"mysql+pymysql://{self.DB_USER}:***"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )


settings = Settings()
