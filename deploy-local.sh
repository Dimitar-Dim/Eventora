#!/bin/bash
set -euo pipefail

PROJECT_DIR="/Users/mitko/Repositories/Individual Project/Eventoria"
cd "$PROJECT_DIR"

echo "=== Starting deployment ==="

# Pull latest code if needed
git fetch origin main
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse origin/main)
if [ "$LOCAL" != "$REMOTE" ]; then
  echo "Pulling latest changes from main..."
  git pull origin main
else
  echo "No changes to pull."
fi

# Run backend tests
echo "Running backend tests..."
cd Backend/Eventora
./gradlew test -q || {
  echo "Tests failed. Aborting deployment."
  exit 1
}
cd "$PROJECT_DIR"

# Rebuild and restart containers
echo "Rebuilding Docker containers..."
docker compose down
docker compose up -d --build

# Wait for backend
echo "Waiting for backend to start..."
for i in {1..15}; do
  if curl -fs http://localhost:8080/actuator/health >/dev/null 2>&1; then
    echo "Backend is reachable at http://localhost:8080"
    BACKEND_UP=true
    break
  fi
  echo "Backend not ready yet... ($i)"
  sleep 3
done

if [ "${BACKEND_UP:-false}" != true ]; then
  echo "Backend did not respond in time. Continuing..."
fi

# Check frontend
echo "Checking frontend availability..."
if curl -fs http://localhost:3000 >/dev/null 2>&1; then
  echo "Frontend is reachable at http://localhost:3000"
else
  echo "Frontend not reachable yet."
fi

# Verify database
echo "Verifying database connection..."
DB_ID=$(docker ps -qf "name=eventora_db")
if [ -n "$DB_ID" ]; then
  docker exec "$DB_ID" psql -U postgres -d eventora -c \
    "SELECT COUNT(*) AS event_count FROM \"Event\";" || \
    echo "Database check failed."
else
  echo "Database container not found."
fi

echo "=== Deployment complete ==="
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8080"
echo "Completed at $(date)"
