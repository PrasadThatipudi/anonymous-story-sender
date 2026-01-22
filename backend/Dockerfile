# Use official Deno image (latest)
FROM denoland/deno:latest

# Set working directory
WORKDIR /app

# Copy dependency files first for better caching
COPY deno.json ./

# Copy Prisma schema
COPY src/infrastructure/database/prisma ./src/infrastructure/database/prisma

# Install Prisma CLI and generate client
RUN deno run -A npm:prisma@5.22.0 generate --schema=./src/infrastructure/database/prisma/schema.prisma

# Copy rest of the application
COPY . .

# Make startup script executable
RUN chmod +x start.sh

# Cache the main application and its dependencies
RUN deno cache src/main.ts

# Expose port
EXPOSE 8000

# Set environment variable for port
ENV PORT=8000

# Run the startup script (handles migrations + app startup)
CMD ["sh", "start.sh"]

