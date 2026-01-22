#!/bin/sh
set -e

echo "🔄 Running database migrations..."
deno run -A npm:prisma@5.22.0 migrate deploy --schema=./src/infrastructure/database/prisma/schema.prisma

echo "🌱 Running database seed (if needed)..."
deno run --allow-all src/infrastructure/database/prisma/seed.ts || echo "⏭️  Seed skipped or already completed"

echo "🚀 Starting application..."
exec deno run --allow-net --allow-env --allow-read --allow-ffi --allow-sys src/main.ts

