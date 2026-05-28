# Use an Alpine-based Node image for a small runtime
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies and generate Prisma client
COPY package.json ./
RUN npm install

COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate

# Final runtime image
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

EXPOSE 3333
CMD ["npx", "tsx", "src/server.ts"]
