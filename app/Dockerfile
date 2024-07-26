FROM node:20

WORKDIR /cache

COPY package.json .
COPY package-lock.json .
RUN npm install 

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY . .