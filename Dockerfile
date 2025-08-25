# Use official Node.js image
FROM node:18

# Install pnpm and a simple HTTP server
RUN npm install -g pnpm serve

# Set working directory
WORKDIR /app

# Copy dependencies files and install
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy all source code
COPY . .

# Build Vite project
RUN pnpm build

# Expose port for the app
EXPOSE 3000

# Serve the built static files
CMD ["serve", "-s", "dist", "-l", "3000"]
