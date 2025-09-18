FROM node:23-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3379

CMD ["npm", "run", "dev"]