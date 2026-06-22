#!/bin/sh
cd /app
if [ -n "$DATABASE_URL" ] && [ -f ./node_modules/.bin/prisma ]; then
  echo "Running database migrations..."
  if ! ./node_modules/.bin/prisma migrate deploy; then
    echo "WARNING: In-container migration failed. Run 'npm run db:deploy' on the host before deploy."
  fi
fi
exec node server.js
