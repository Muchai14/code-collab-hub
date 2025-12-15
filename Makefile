.PHONY: help build up down logs restart clean test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build all Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

dev: ## Start all services with logs
	docker-compose up

down: ## Stop all services
	docker-compose down

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

logs-nginx: ## View nginx logs
	docker-compose logs -f nginx

logs-db: ## View database logs
	docker-compose logs -f postgres

restart: ## Restart all services
	docker-compose restart

restart-backend: ## Restart backend service
	docker-compose restart backend

restart-nginx: ## Restart nginx service
	docker-compose restart nginx

clean: ## Stop services and remove volumes
	docker-compose down -v

rebuild: ## Rebuild and restart all services
	docker-compose down
	docker-compose build
	docker-compose up -d

test: ## Run backend tests (Docker)
	docker-compose exec backend pytest

test-local: ## Run backend tests (local, no Docker)
	./run-tests.sh

test-integration: ## Run integration tests (Docker)
	docker-compose exec backend pytest tests_integration

test-integration-local: ## Run integration tests (local, no Docker)
	./run-tests.sh tests_integration

# Production deployment (combined container)
build-prod: ## Build production image (combined frontend+backend)
	docker build -t code-collab-hub:latest .

run-prod: ## Run production setup with docker-compose
	docker-compose -f docker-compose.prod.yml up -d

stop-prod: ## Stop production setup
	docker-compose -f docker-compose.prod.yml down

logs-prod: ## View production logs
	docker-compose -f docker-compose.prod.yml logs -f

clean-prod: ## Stop production and remove volumes
	docker-compose -f docker-compose.prod.yml down -v

# Development commands
shell-backend: ## Open shell in backend container
	docker-compose exec backend bash

shell-db: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U code_collab -d code_collab_db

status: ## Show status of all services
	docker-compose ps

prune: ## Remove all stopped containers and unused images
	docker system prune -af
