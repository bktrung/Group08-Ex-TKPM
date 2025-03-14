FROM node:23.9-alpine
WORKDIR /usr/src/app
EXPOSE 3456

RUN apk add --no-cache \
    python3 \
    make \
    g++

COPY package*.json ./

RUN npm ci

COPY . .