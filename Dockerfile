FROM node:20-alpine

WORKDIR /app

# Copy package specifications
COPY package*.json ./

# Install dependencies
RUN npm ci --include=dev

# Copy application source
COPY . .

# Build Vite frontend
RUN npm run build

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
