FROM rust:alpine3.14 as build

RUN apk update && apk add --no-cache \
    musl-dev

COPY ./src ./src
COPY ./Cargo.toml ./Cargo.toml

RUN cargo build --release

FROM alpine:3.14 as runner

RUN mkdir /usr/local/service

COPY --from=build /target/release/actixtest /usr/local/service/actixtest

WORKDIR /usr/local/service

COPY ./static ./static

EXPOSE 8080 8080

ENTRYPOINT ["./actixtest"]