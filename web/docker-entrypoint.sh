#!/bin/sh
cd /app
if [ -n "$DATABASE_URL" ] && [ -f ./node_modules/prisma/build/index.js ]; then
  echo "Running database migrations..."
  if ! node ./node_modules/prisma/build/index.js migrate deploy; then
    echo "WARNING: In-container migration failed. Run 'npm run db:deploy' on the host before deploy."
  fi
fi
exec node server.js
