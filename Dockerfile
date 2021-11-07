# Build backend
FROM rust:alpine3.14 as build-backend
ENV RUSTFLAGS="-C target-feature=-crt-static"

RUN apk update && apk add --no-cache \
    musl-dev postgresql-dev

COPY ./src ./src
COPY ./Cargo.toml ./Cargo.toml
COPY ./migrations ./migrations

RUN cargo build --release

# Build frontend
FROM node:12.7-alpine AS build-frontend

WORKDIR /usr/src/app

COPY /frontend/package*.json ./

RUN npm ci

COPY /frontend .

ENV NODE_ENV production

RUN npm run build

FROM alpine:3.14 as runner

RUN apk update && apk add --no-cache \
    postgresql

RUN mkdir /usr/local/service

COPY --from=build-backend /target/release/replay_service /usr/local/service/replay_service
COPY --from=build-backend ./migrations /usr/local/service/migrations

WORKDIR /usr/local/service

COPY --from=build-frontend /usr/src/app/dist /usr/local/service/static

EXPOSE 8080

ENTRYPOINT ["./replay_service"]