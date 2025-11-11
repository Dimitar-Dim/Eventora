#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/Backend/Eventora"
FRONTEND_DIR="$PROJECT_DIR/Frontend"

echo "=== Local deployment started ==="

# 1) Pull latest changes
if git -C "$PROJECT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git -C "$PROJECT_DIR" fetch origin main || true
  LOCAL=$(git -C "$PROJECT_DIR" rev-parse @ || echo "")
  REMOTE=$(git -C "$PROJECT_DIR" rev-parse origin/main || echo "")
  if [ -n "$LOCAL" ] && [ -n "$REMOTE" ] && [ "$LOCAL" != "$REMOTE" ]; then
    echo "Updating local main..."
    git -C "$PROJECT_DIR" pull --ff-only origin main || true
  fi
fi

# 2) Run backend tests
echo "Running backend tests..."
(cd "$BACKEND_DIR" && chmod +x ./gradlew && ./gradlew test --no-daemon -q)

# 3) Rebuild app containers
echo "Rebuilding Docker containers (backend + frontend, no deps)..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.yaml down --remove-orphans || true
docker compose -f docker-compose.yaml up -d --build --no-deps backend frontend
docker compose -f docker-compose.yaml ps

# 4) Wait for backend
for i in {1..60}; do
  if curl -fsS http://localhost:8080/actuator/health | grep -q '"status":"UP"'; then
    echo "Backend ready."
    break
  fi
  echo "Waiting for backend ($i)..."
  sleep 1
done

# 5) Wait for frontend
for i in {1..60}; do
  if curl -fsS http://localhost:3000 >/dev/null; then
    echo "Frontend ready."
    break
  fi
  echo "Waiting for frontend ($i)..."
  sleep 1
done

echo "=== Local deployment complete ==="
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8080"
