# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Create .env file from environment variables
RUN echo "PORT=${PORT}" >> .env && \
    echo "MONGODB_URI=${MONGODB_URI}" >> .env && \
    echo "JWT_SECRET=${JWT_SECRET}" >> .env && \
    echo "JWT_EXPIRE=${JWT_EXPIRE}" >> .env && \
    echo "FRONTEND_URL=${FRONTEND_URL}" >> .env

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]