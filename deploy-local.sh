#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/Backend/Eventora"
FRONTEND_DIR="$PROJECT_DIR/Frontend"

echo "=== Local deployment started ==="

# 1. Pull latest changes
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git fetch origin main
  LOCAL=$(git rev-parse @)
  REMOTE=$(git rev-parse origin/main)
  if [ "$LOCAL" != "$REMOTE" ]; then
    echo "Updating local main..."
    git pull origin main
  fi
fi

# 2. Run backend tests
echo "Running backend tests..."
cd "$BACKEND_DIR"
./gradlew test -q
cd "$PROJECT_DIR"

# 3. Rebuild stack
echo "Rebuilding Docker containers..."
docker compose down
docker compose up -d --build

# 4. Wait for backend
for i in {1..20}; do
  if curl -fs http://localhost:8080/actuator/health >/dev/null 2>&1; then
    echo "Backend ready."
    break
  fi
  echo "Waiting for backend ($i)..."
  sleep 3
done

# 5. Wait for frontend
for i in {1..20}; do
  if curl -fs http://localhost:3000 >/dev/null 2>&1; then
    echo "Frontend ready."
    break
  fi
  echo "Waiting for frontend ($i)..."
  sleep 3
done

# 6. DB sanity check
DB_CONTAINER=$(docker compose ps -q db || true)
if [ -n "$DB_CONTAINER" ]; then
  docker exec "$DB_CONTAINER" psql -U postgres -d eventora -c "SELECT NOW();" >/dev/null 2>&1 \
    && echo "Database OK." || echo "DB check failed."
fi

echo "=== Local deployment complete ==="
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8080"
