# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve package globally to serve static files
RUN npm install -g serve

# Cloud Run sets the PORT environment variable (default 8080)
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Start the application using serve
# -s: Single page application (rewrites 404s to index.html)
# -l: Listen on specified port
CMD ["sh", "-c", "serve -s dist -l $PORT"]
