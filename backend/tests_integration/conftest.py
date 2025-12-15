import pytest
import asyncio
import os
import sys

# Add parent directory to path to import main
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from main import fastapi_app
from database import Base, get_db

# Use an in-memory SQLite database for testing (or a file)
# In-memory with multiple connections/async can be tricky with shared cache
# So we use a file for robustness in async tests, or shared cache string.
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_integration.db"

engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

TestingSessionLocal = async_sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

@pytest.fixture
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Cleanup after tests
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()
    
    # Remove file if it exists
    if os.path.exists("./test_integration.db"):
        os.remove("./test_integration.db")

@pytest.fixture
async def db_session(setup_db):
    async with TestingSessionLocal() as session:
        yield session

@pytest.fixture
async def client(db_session):
    async def override_get_db():
        yield db_session

    fastapi_app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(app=fastapi_app, base_url="http://test") as c:
        yield c
    fastapi_app.dependency_overrides.clear()
