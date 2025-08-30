# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install deps
COPY package.json package-lock.json* ./
RUN npm install

# Copy everything
COPY . .

# Build the project
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app ./

# Expose port
EXPOSE 3000

# Run Next.js
CMD ["npm", "start"]
