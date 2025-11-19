# Use Python base image
FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Make build script executable and run it
RUN chmod +x build.sh && ./build.sh 2>&1 | tee /tmp/build.log

# Debug: Show what was built
RUN echo "=== Checking frontend build ===" && \
    ls -la /app/frontend/ && \
    echo "=== Checking dist folder ===" && \
    ls -la /app/frontend/dist/ || echo "ERROR: No dist folder found!"

# Change to backend directory
WORKDIR /app/backend

# Expose port
EXPOSE 8080

# Start gunicorn
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8080", "--timeout", "300", "--workers", "1", "--threads", "2"]