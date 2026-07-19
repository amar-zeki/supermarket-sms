# NexaMart Supermarket Management System Developer Shortcuts

.PHONY: up down restart logs ps db-init backend-install build clean shell

# Run Docker development containers
up:
	docker compose --profile dev up -d

# Stop Docker containers
down:
	docker compose --profile dev down

# Restart Docker containers
restart:
	docker compose --profile dev restart

# Display log streams
logs:
	docker compose --profile dev logs -f

# List container states
ps:
	docker compose --profile dev ps

# Load database schema from script
db-init:
	docker exec -i nexamart_db mysql -u root -pnexamart_root_2024 nexamart_db < docker/mysql/init/01_schema.sql

# Install composer backend dependencies inside container
backend-install:
	docker exec -it nexamart_app composer install --working-dir=backend

# Full build setup from scratch
build:
	copy .env.example .env
	docker compose --profile dev build --no-cache
	docker compose --profile dev up -d
	docker exec -it nexamart_app composer install --working-dir=backend

# Shell access into PHP container
shell:
	docker exec -it nexamart_app bash
