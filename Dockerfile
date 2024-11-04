# Use node image for base image for all stages.
FROM node:20.17.0-alpine AS base

# Set working directory for all build stages.
WORKDIR /usr/src/app

# Create a stage for installing production dependencies.
FROM base AS deps

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 4200

# Run the application using the locally installed Angular CLI
CMD ["npx", "ng", "serve", "--host", "0.0.0.0"]
