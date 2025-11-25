# **************************************************************************** #
#                               42-matcha Makefile                             #
# **************************************************************************** #

PROJECT_NAME := 42-matcha

# Docker
DOCKER_COMPOSE := docker compose
DOCKER_COMPOSE_FILE := docker-compose.yml

# Colors
GREEN := \033[0;32m
RED := \033[0;31m
YELLOW := \033[1;33m
NC := \033[0m

# 🟢 Commandes principales
all: up

up:
	@echo "$(GREEN)[+] Starting $(PROJECT_NAME) containers...$(NC)"
	@$(DOCKER_COMPOSE) --env-file .env up -d --build


clean:
	@echo "$(YELLOW)[*] Stopping and removing containers (but keeping volumes)...$(NC)"
	@$(DOCKER_COMPOSE) down

fclean:
	@echo "$(RED)[!] Stopping and removing containers, networks, volumes, images...$(NC)"
	@$(DOCKER_COMPOSE) down -v --rmi all

# re: fclean all
re: clean all

db:
	@echo "$(GREEN)[+] Connecting to PostgreSQL database...$(NC)"
	@if [ -f .env ]; then \
		export $$(grep -v '^#' .env | xargs) && \
		$(DOCKER_COMPOSE) exec db psql -U $$DB_USER -d $$DB_NAME; \
	else \
		echo "$(RED)[!] .env file not found. Please create one with DB_USER and DB_NAME variables.$(NC)"; \
	fi

help:
	@echo ""
	@echo "$(GREEN)Makefile for $(PROJECT_NAME)$(NC)"
	@echo ""
	@echo "$(YELLOW)Available commands:$(NC)"
	@echo "  $(GREEN)make$(NC) / $(GREEN)make all$(NC)      → Build & run containers (docker-compose up --build)"
	@echo "  $(GREEN)make clean$(NC)         → Stop and remove containers only"
	@echo "  $(GREEN)make fclean$(NC)        → Remove containers, volumes, images"
	@echo "  $(GREEN)make re$(NC)            → Full rebuild (fclean + all)"
	@echo "  $(GREEN)make db$(NC)            → Connect to PostgreSQL database (psql)"
	@echo "  $(GREEN)make help$(NC)          → Show this help message"
	@echo ""



.PHONY: all up clean fclean re db help
