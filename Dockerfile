FROM node:18-slim

# Install Python and build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY python_modules/requirements.txt ./python_modules/

# Install Node dependencies
RUN npm install

# Install Python dependencies
RUN pip3 install --no-cache-dir -r python_modules/requirements.txt

# Copy source code
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Back to root
WORKDIR /app

# Create uploads directory
RUN mkdir -p /tmp/uploads

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
