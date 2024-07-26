FROM node:20

WORKDIR /cache

COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN  npx prisma generate


WORKDIR /server
ENV PATH /server/node_modules/.bin:$PATH
COPY . .

# FROM node:18 AS builder

# # Create app directory
# WORKDIR /app

# # A wildcard is used to ensure both package.json AND package-lock.json are copied
# COPY package*.json ./
# COPY prisma ./prisma/

# # Install app dependencies
# RUN npm install

# COPY . .

# RUN npm run build

# FROM node:18

# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/dist ./dist

# EXPOSE 3080
# CMD [ "npm", "run", "start:prod" ]
