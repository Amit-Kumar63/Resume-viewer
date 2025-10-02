FROM node:18

# Set the working directory in the container
WORKDIR /src/server

# Copy package.json and package-lock.json to the working directory
# This allows Docker to cache the npm install step, improving build times
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port your application listens on
EXPOSE 3000

# Define the command to run your application
CMD [ "node", "src/server.js" ]