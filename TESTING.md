# Testing Guide

## Prerequisites

### For Local Tests (No Docker)

You must have backend dependencies installed:

```bash
# Option 1: Install in virtual environment (recommended)
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Option 2: Use root virtual environment
source .venv/bin/activate
cd backend
pip install -r requirements.txt
```

### For Docker Tests

Docker services must be running:

```bash
make up
# or
docker-compose up -d
```

## Running Tests

The project has multiple ways to run tests depending on your setup:

### 🐳 With Docker (Recommended for CI/Production)

**Prerequisites**: Docker services must be running (`make up` or `make dev`)

```bash
# All tests
make test

# Integration tests only
make test-integration
```

### 💻 Local Development (No Docker Required)

**Prerequisites**: Backend dependencies installed (`pip install -r backend/requirements.txt`)

```bash
# All tests
make test-local

# Integration tests only  
make test-integration-local

# Or directly with the script
./run-tests.sh
./run-tests.sh tests_integration

# Or from backend directory
cd backend
python -m pytest
python -m pytest tests_integration
```

### 🎯 Using pytest directly

```bash
# From backend directory
cd backend
pytest                          # All tests
pytest tests/                   # Unit tests only
pytest tests_integration/       # Integration tests only
pytest -v                       # Verbose output
pytest -k "test_create"         # Run specific tests
```

## Test Structure

```
backend/
├── tests/                  # Unit tests
│   └── test_api.py        # API endpoint tests (uses TestClient)
└── tests_integration/      # Integration tests  
    ├── conftest.py        # Test fixtures and setup
    └── test_flows.py      # Full integration tests (uses actual DB)
```

### Unit Tests (`tests/`)
- Use FastAPI's `TestClient`
- Mock database interactions
- Test individual endpoints
- Fast execution

### Integration Tests (`tests_integration/`)
- Use real SQLite database (isolated)
- Test complete user flows
- Verify database state
- Test API + Database integration

## Common Test Commands

### Run specific test file
```bash
cd backend
pytest tests/test_api.py
pytest tests_integration/test_flows.py
```

### Run specific test function
```bash
cd backend
pytest tests/test_api.py::test_create_room
pytest tests_integration/test_flows.py::test_join_room_flow
```

### Run with coverage
```bash
cd backend
pytest --cov=. --cov-report=html
# View coverage report in htmlcov/index.html
```

### Run with verbose output
```bash
cd backend
pytest -v
pytest -vv  # Extra verbose
```

### Run and show print statements
```bash
cd backend
pytest -s
```

## Test Results

All 8 tests should pass:
- ✅ 4 unit tests (API endpoints)
- ✅ 4 integration tests (full flows)

## Troubleshooting

### "ModuleNotFoundError: No module named 'sqlalchemy'"

**Problem**: Dependencies not installed or not in Python path

**Solution**:
```bash
# Option 1: Run from backend directory
cd backend
python -m pytest

# Option 2: Use the helper script
./run-tests.sh

# Option 3: Use make command
make test-local

# Option 4: Install dependencies
cd backend
pip install -r requirements.txt
```

### "service 'backend' is not running" (Docker)

**Problem**: Docker containers not started

**Solution**:
```bash
# Start Docker services first
make up
# or
docker-compose up -d

# Then run tests
make test
```

### Database locked errors

**Problem**: SQLite database in use

**Solution**:
```bash
# Remove test databases
rm backend/test_integration.db
rm backend/sql_app.db

# Run tests again
make test-local
```

## Continuous Integration

For CI/CD pipelines, use the Docker-based tests:

```yaml
# Example GitHub Actions
- name: Start services
  run: docker-compose up -d
  
- name: Wait for services
  run: sleep 5
  
- name: Run tests
  run: make test
  
- name: Stop services
  run: docker-compose down
```

## Writing New Tests

### Unit Test Example
```python
# backend/tests/test_api.py
def test_my_endpoint():
    response = client.post("/api/my-endpoint", json={"data": "value"})
    assert response.status_code == 200
    assert response.json()["result"] == "expected"
```

### Integration Test Example
```python
# backend/tests_integration/test_flows.py
@pytest.mark.asyncio
async def test_my_flow(client, db_session):
    # Create via API
    response = await client.post("/api/resource", json={"name": "test"})
    
    # Verify in database
    result = await db_session.execute(select(DBModel).filter(...))
    obj = result.scalars().first()
    assert obj.name == "test"
```

## Quick Reference

| Command | Description | Requires Docker |
|---------|-------------|-----------------|
| `make test` | Run all tests | ✅ Yes |
| `make test-local` | Run all tests | ❌ No |
| `make test-integration` | Run integration tests | ✅ Yes |
| `make test-integration-local` | Run integration tests | ❌ No |
| `./run-tests.sh` | Run all tests | ❌ No |
| `cd backend && pytest` | Run all tests | ❌ No |

## Frontend Tests

Frontend tests are separate:

```bash
# From project root
npm test

# From frontend directory
cd frontend
npm test
npm run test:watch
```
