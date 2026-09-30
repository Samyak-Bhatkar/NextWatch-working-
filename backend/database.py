import logging
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.config import settings

logger = logging.getLogger(__name__)

# In DEMO_MODE or if DATABASE_URL is not a real PostgreSQL URL, use SQLite in-memory
_demo_mode = os.getenv("DEMO_MODE", "false").lower() in ["1", "true", "yes"]
_db_url = settings.DATABASE_URL

if _demo_mode or not _db_url or _db_url.startswith("postgresql://postgres:postgres@localhost"):
    # Use SQLite in-memory for demo/no-DB deployments
    _db_url = "sqlite:///./nexwatch_demo.db"
    logger.info("DEMO_MODE or no external DB detected — using SQLite in-memory database.")

try:
    if _db_url.startswith("sqlite"):
        engine = create_engine(
            _db_url,
            connect_args={"check_same_thread": False},
            pool_pre_ping=True,
            echo=False,
        )
    else:
        engine = create_engine(
            _db_url,
            pool_pre_ping=True,
            echo=False,
        )
except Exception as e:
    logger.warning(f"Could not create database engine ({e}), falling back to SQLite.")
    engine = create_engine(
        "sqlite:///./nexwatch_demo.db",
        connect_args={"check_same_thread": False},
        echo=False,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
