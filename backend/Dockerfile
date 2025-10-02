FROM node:18-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npx prisma generate

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package.json .
EXPOSE 3001
CMD ["node", "dist/server.js"]
