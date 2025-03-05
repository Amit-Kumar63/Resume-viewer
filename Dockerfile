# Use an official Node.js image with Debian
FROM node:18

# Install Tesseract OCR
RUN apt-get update && apt-get install -y tesseract-ocr

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire project into the container
COPY . .

# Expose the port Render assigns (PORT environment variable)
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]