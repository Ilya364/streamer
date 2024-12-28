# Use an official Node runtime as the base image
FROM node:14

# Install FFmpeg and curl for healthcheck
# RUN apt-get update && apt-get install -y ffmpeg curl

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the application code to the container
COPY . .

# Make port 2000 available outside the container
EXPOSE 2000

# Define environment variables
ENV PORT=2000
ENV STREAM_URL=rtsp://rtspstream:5306c5e1c41fdb6cd55de232f15f0aca@zephyr.rtsp.stream/movie
ENV THERMAL_URL=rtsp://rtspstream:e0d9feac5e5219298d8e8bd9108650a0@zephyr.rtsp.stream/pattern

# Run the application
CMD ["node", "index.js"]