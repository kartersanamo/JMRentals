#!/bin/sh
cd /app
if [ -n "$DATABASE_URL" ] && [ -f ./node_modules/.bin/prisma ]; then
  echo "Running database migrations..."
  ./node_modules/.bin/prisma migrate deploy || echo "Migration skipped (already applied or unavailable)."
fi
exec node server.js
