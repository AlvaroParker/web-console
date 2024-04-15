# Name of the image
# to compile just create the container, copy the file to /usr/src/app/devcontainer/src/main.rs and start the container
# finally capture the logs with docker logs <container_id>
FROM rust:1.67

WORKDIR /usr/src/app

RUN cargo new devcontainer

WORKDIR /usr/src/app/devcontainer

CMD ["/usr/local/cargo/bin/cargo", "run"]
