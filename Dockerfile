FROM node:10-alpine AS builder

# Create app directory
WORKDIR /tmp/

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Install node_modules
RUN npm ci

# Bundle app source
COPY . .

# Compile 
RUN [ "npm", "run", "tsc" ]

FROM node:10-alpine
WORKDIR /usr/src/app/

# Copy everyting from builder
COPY --from=builder /usr/tmp/build .
COPY --from=builder /usr/tmp/package*.json .

# Install depencies
RUN npm ci --only=production

EXPOSE 80
VOLUME ["/usr/src/app/replays"]

ENTRYPOINT [ "npm", "run", "prod" ]