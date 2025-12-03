# Stage 1: Build the React application
FROM node:18-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run defaults to port 8080
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
