
# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container to /app
WORKDIR /thread-clone-backend

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Install PM2 globally in the container
RUN npm install pm2 -g

# Bundle the app source inside the Docker image
COPY . .

# Make port  5000 available outside the container
EXPOSE  5000


HEALTHCHECK --interval=30s --timeout=3s --start-period=1s --retries=3 \
    CMD curl --fail http://localhost:5001 || exit  1

# Define the command to run the app with PM2
CMD ["pm2-runtime", "start", "index.js", "--name", "api", "-i", "2"]



# # Use an official Node.js runtime as the base image
# FROM ubuntu As build
# # FROM alpine:latest AS build

# # Set the working directory in the container to /app
# WORKDIR /app

# # Bundle the app source inside the Docker image

# FROM node:18 as nodebuild

# WORKDIR /appbuild

# # Copy files from the build stage
# COPY --from=build /app /appbuild

# # Copy package.json and package-lock.json to the working directory
# COPY package*.json ./

# COPY . .
# # Install any needed packages specified in package.json
# RUN npm install

# # Install PM2 globally in the container
# RUN npm install pm2 -g

# # Define the entry point for your application
# # ENTRYPOINT ["/"]
# # FROM gcr.io/distroless/nodejs18-debian11

# # WORKDIR /thread-clone-backend

# # COPY --from=nodebuild /appbuild /thread-clone-backend

# # USER nonroot

# EXPOSE  5001
# # # Healthcheck for the container
# # HEALTHCHECK --interval=30s --timeout=3s --start-period=1s --retries=3 \
# #     CMD curl --fail http://localhost:5001 || exit  1

# # Define the command to run the app with PM2
# CMD ["pm2-runtime", "start", "/appbuild/index.js", "--name", "api", "-i", "2"]



# # First stage: build the application
# FROM node:18 AS builder

# # Set the working directory in the container to /app
# WORKDIR /app

# # Copy package.json and package-lock.json to the working directory
# COPY package*.json ./

# # Install any needed packages specified in package.json
# RUN npm install

# # Bundle the app source inside the Docker image
# COPY . .

# # Second stage: copy built application to a distroless image
# FROM gcr.io/distroless/nodejs

# # Set the working directory in the container to /app
# WORKDIR /app

# # Copy the application files from the builder stage
# COPY --from=builder /app .

# # Make port  5000 available outside the container
# EXPOSE  5000

# # Define the command to run the app
# CMD ["node", "index.js"]


# FROM node:18.15.0-alpine AS build

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# # Stage  2: Setup the runtime environment

# FROM gcr.io/distroless/nodejs18-debian11

# WORKDIR /test

# COPY --from=build /app /test

# USER nonroot

# CMD ["index.js"]

# EXPOSE  5001
