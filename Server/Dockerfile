# Use an official Node.js runtime as the base image
FROM node:20

# Install qpdf
RUN apt-get update && apt-get install -y qpdf

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json into the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on
EXPOSE 4000

# Command to run the app
CMD ["node", "server"]