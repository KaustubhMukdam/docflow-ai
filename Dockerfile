# Use Motia's official Docker image (includes Node + Python)
FROM motiadev/motia:latest

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install Node dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# CRITICAL: Setup Python dependencies for your .py steps
RUN npx motia@latest install

# Expose Motia's default port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
