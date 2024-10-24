# Use an official Node runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install the application dependencies
RUN npm install
RUN apt-get update && apt-get install -y ffmpeg

# Copy the application code to the container
COPY . .

# Make port 2000 available outside the container

# Define environment variables
ENV PORT=2000
ENV VISUAL_STREAM_URL=rtsp://rtspstream:7451a185427ca7dcfe857733abe4c6ae@zephyr.rtsp.stream/pattern
ENV THERMAL_STREAM_URL=rtsp://rtspstream:7451a185427ca7dcfe857733abe4c6ae@zephyr.rtsp.stream/pattern

# Run the application
CMD ["node", "index.js"]