FROM node:20-alpine AS build
WORKDIR /app
# Copy root package.json and package-lock.json
COPY package*.json ./
RUN npm install
# Copy backend source code
COPY backend ./backend

# Production image
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app .
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "backend/server.js"]
