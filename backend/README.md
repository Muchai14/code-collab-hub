# Backend - Code Collaboration Hub

This is the FastAPI backend for the Code Collaboration Hub. It provides REST API endpoints for room management and a Socket.IO server for real-time collaboration.

## Prerequisites

- Python 3.10+
- pip

## Setup & Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

Start the development server with live reload:

```bash
uvicorn main:app --host 0.0.0.0 --port 3001 --reload
```

The server will start at `http://localhost:3001`.

## API Documentation

FastAPI automatically generates interactive API documentation. Once the server is running, you can open:

- **Swagger UI**: [http://localhost:3001/docs](http://localhost:3001/docs) - Interactive interface to test API endpoints directly in your browser.
- **ReDoc**: [http://localhost:3001/redoc](http://localhost:3001/redoc) - Alternative documentation view.

## Running Tests

There are two ways to test the backend:

### 1. Unit & Integration Tests (Pytest)

Run the full test suite using `pytest`. This runs tests defined in `backend/tests/`.

```bash
pytest
```

or specifically:

```bash
pytest tests/test_api.py
```

### 2. API Verification Script

We have a standalone script that performs a live health check and verifies the core workflows (Create -> Join -> Get Room) against a **running server**.

1. Ensure the server is running in one terminal (see "Running the Server" above).
2. In a separate terminal, run:

```bash
python verify_api.py
```

This will print the success/failure status of the core operations.
