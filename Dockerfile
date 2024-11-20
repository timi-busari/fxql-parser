# Use Node.js LTS version
FROM node:18-alpine AS base

# Install necessary dependencies
RUN apk add --no-cache libc6-compat

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build stage
FROM base AS builder
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install necessary dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy generated Prisma client
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy built assets and node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Set environment to production
ENV NODE_ENV=production

# Expose the port (Render will set the PORT environment variable)
EXPOSE 10000

# Command to run the application and run migration
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

