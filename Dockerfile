FROM node:18-slim

# Install Python and build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install Node dependencies (this creates python_modules/)
RUN npm ci --only=production

# Now python_modules exists, install Python deps
RUN if [ -f python_modules/requirements.txt ]; then \
      pip3 install --no-cache-dir -r python_modules/requirements.txt; \
    fi

# Copy source code
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm ci
RUN npm run build

# Back to root
WORKDIR /app

# Create temp uploads directory
RUN mkdir -p /tmp/uploads

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
