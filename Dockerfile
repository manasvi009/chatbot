# Use the official Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies for both client and server
RUN npm install
RUN cd server && npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Expose the port
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]