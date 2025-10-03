FROM node:23-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3379

RUN npx prisma generate

CMD ["npm", "run", "dev"]