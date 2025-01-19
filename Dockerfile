# Use Node.js 18 as the base image
FROM node:16


# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json, then install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files
COPY . .

# Install sqlite3 from source (force rebuild)
RUN npm install sqlite3 --build-from-source

# Expose port 5000
EXPOSE 5000

# Run the app
CMD ["npm", "start"]
