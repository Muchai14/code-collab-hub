# Code Collaboration Hub

A real-time collaborative code editor with support for multiple programming languages, live code execution, and multi-user collaboration.

## Features

- 🚀 Real-time collaborative code editing
- 🔄 Live cursor tracking for multiple users
- ⚡ Code execution (JavaScript & Python)
- 🎨 Syntax highlighting with Monaco Editor
- 👥 Multi-user rooms with participant management
- 🔌 WebSocket-based real-time communication
- 🐘 PostgreSQL database for data persistence
- 🐳 Docker Compose for easy deployment

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Monaco Editor** for code editing
- **Socket.IO Client** for real-time communication
- **TailwindCSS** with shadcn/ui components
- **React Router** for navigation

### Backend
- **FastAPI** (Python) for REST API
- **Socket.IO** for WebSocket communication
- **SQLAlchemy** (async) for database ORM
- **PostgreSQL** for production database
- **SQLite** for development/testing
- **Pydantic** for data validation

### Infrastructure
- **Docker Compose** for orchestration
- **Nginx** for reverse proxy and static file serving
- **PostgreSQL 15** for database

## Quick Start with Docker

### Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)

### Running the Application

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd code-collab-hub
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```
   
   Or using the Makefile:
   ```bash
   make dev
   ```

3. **Access the application**
   - Frontend: http://localhost
   - Backend API Docs: http://localhost/api/docs
   - Health Check: http://localhost/health

4. **Stop the application**
   ```bash
   docker-compose down
   ```
   
   Or using the Makefile:
   ```bash
   make down
   ```

For more Docker commands, see [DOCKER.md](./DOCKER.md) or run `make help`.

## Development Setup (Local)

### Quick Setup (Automated)

Run the setup script to automatically create a virtual environment and install all dependencies:

```bash
./setup.sh
```

Then activate the virtual environment:

```bash
source .venv/bin/activate
```

### Manual Setup

#### Backend

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server**
   ```bash
   uvicorn main:app --reload --port 3001
   ```

5. **Run tests**
   ```bash
   # From project root (with venv activated)
   make test-local
   
   # Or from backend directory
   cd backend
   pytest
   pytest tests_integration  # Integration tests with SQLite
   ```

### Frontend

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
code-collab-hub/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application & Socket.IO handlers
│   ├── models.py           # Pydantic models
│   ├── db_models.py        # SQLAlchemy models
│   ├── database.py         # Database configuration
│   ├── tests/              # Unit tests
│   ├── tests_integration/  # Integration tests
│   ├── Dockerfile          # Backend Docker image
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities
│   │   └── hooks/         # Custom hooks
│   ├── Dockerfile         # Frontend Docker image
│   └── package.json       # Node dependencies
├── nginx/                 # Nginx configuration
│   └── nginx.conf         # Nginx reverse proxy config
├── docker-compose.yml     # Docker Compose orchestration
├── Makefile              # Convenient Docker commands
└── DOCKER.md             # Docker documentation
```

## API Documentation

When the backend is running, visit:
- Swagger UI: http://localhost:3001/docs (local) or http://localhost/api/docs (Docker)
- ReDoc: http://localhost:3001/redoc (local) or http://localhost/api/redoc (Docker)
- OpenAPI JSON: http://localhost:3001/openapi.json

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string (Docker sets this automatically)

### Frontend
- `VITE_API_URL`: Backend API URL
- `VITE_WS_URL`: WebSocket server URL

See `.env.example` for all available variables.

## Testing

### Backend Tests
```bash
# Unit tests
docker-compose exec backend pytest tests/

# Integration tests
docker-compose exec backend pytest tests_integration/

# All tests
docker-compose exec backend pytest
```

### Frontend Tests
```bash
# In the frontend directory
npm test
```

## Database

### Development
- Uses SQLite by default (`sql_app.db`)

### Docker/Production
- Uses PostgreSQL
- Database is automatically initialized on startup
- Data persists in Docker volume `postgres_data`

### Connect to PostgreSQL in Docker
```bash
make shell-db
# Or
docker-compose exec postgres psql -U code_collab -d code_collab_db
```

## Troubleshooting

See [DOCKER.md](./DOCKER.md) for detailed troubleshooting guide.

### Common Issues

**Port conflicts:**
```bash
# Check what's using port 80
sudo lsof -i :80
# Check what's using port 3001
sudo lsof -i :3001
```

**Database connection issues:**
```bash
# View database logs
docker-compose logs postgres
```

**Frontend not loading:**
```bash
# Rebuild frontend
docker-compose up --build frontend
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
