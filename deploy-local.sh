#!/usr/bin/env bash
# Ensures the script exits immediately if a command exits with a non-zero status
set -euo pipefail

# Define directories relative to the script's location
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/Backend/Eventora"
FRONTEND_DIR="$PROJECT_DIR/Frontend"

echo "=== Local deployment workflow started ==="

# 1) Pull latest changes from git
echo "Checking for latest changes..."
# Check if we are inside a git work tree
if git -C "$PROJECT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git -C "$PROJECT_DIR" fetch origin main || true
  LOCAL=$(git -C "$PROJECT_DIR" rev-parse @ || echo "")
  REMOTE=$(git -C "$PROJECT_DIR" rev-parse origin/main || echo "")
  if [ -n "$LOCAL" ] && [ -n "$REMOTE" ] && [ "$LOCAL" != "$REMOTE" ]; then
    echo "Updating local 'main' branch..."
    git -C "$PROJECT_DIR" pull --ff-only origin main || true
  else
    echo "Local 'main' is up-to-date."
  fi
else
  echo "Not in a git repository. Skipping pull."
fi

# 2) Run backend tests
echo "Running backend tests..."
(cd "$BACKEND_DIR" && chmod +x ./gradlew && ./gradlew test --no-daemon -q)
echo "Backend tests completed successfully."

# 3) Rebuild and restart app containers
echo "Shutting down old backend and frontend containers..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yaml stop backend frontend || true
docker compose -f docker-compose.yaml rm -f backend frontend || true

echo "Rebuilding and starting Docker containers (backend + frontend)..."
docker compose -f docker-compose.yaml up -d --build --no-deps backend frontend
docker compose -f docker-compose.yaml ps

# 4) Wait for backend health check
echo "Waiting for backend to be ready (max 60s)..."
BACKEND_URL="http://localhost:8080/actuator/health"
for i in {1..60}; do
  if curl -fsS "$BACKEND_URL" | grep -q '"status":"UP"'; then
    echo "Backend ready (Status: UP)."
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Error: Backend did not become ready in time." >&2
    exit 1
  fi
  echo "Waiting for backend ($i)..."
  sleep 1
done

# 5) Wait for frontend to be accessible
echo "Waiting for frontend to be accessible (max 60s)..."
FRONTEND_URL="http://localhost:3000"
for i in {1..60}; do
  if curl -fsS "$FRONTEND_URL" >/dev/null; then
    echo "Frontend ready."
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Error: Frontend did not respond in time." >&2
    exit 1
  fi
  echo "Waiting for frontend ($i)..."
  sleep 1
done

echo "=== Local deployment complete ==="
echo "Frontend: $FRONTEND_URL"
echo "Backend:  http://localhost:8080 (Health: $BACKEND_URL)"