# Name of the image
FROM rust:1.67

WORKDIR /usr/src/app

RUN cargo new devcontainer

WORKDIR /usr/src/app/devcontainer

CMD ["/usr/local/cargo/bin/cargo run"]
