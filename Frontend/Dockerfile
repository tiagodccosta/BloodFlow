# Use official Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of your frontend app
COPY . .

# Build the app for production
RUN npm run build

# Install 'serve' to serve the React app
RUN npm install -g serve

# Expose port for the app to run on
EXPOSE 3000

# Command to run the app
CMD ["serve", "-s", "build", "-l", "3000"]
