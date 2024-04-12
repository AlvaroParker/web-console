\c webterminalDB

CREATE TABLE IF NOT EXISTS users(
  name VARCHAR(64) NOT NULL,
  lastname VARCHAR(64) NOT NULL,
  email VARCHAR(64) UNIQUE NOT NULL,
  password VARCHAR(64) UNIQUE NOT NULL
);


-- Table with foreign key email
CREATE TABLE IF NOT EXISTS terminals(
  id SERIAL PRIMARY KEY,
  containerid VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(64) NOT NULL,
  FOREIGN KEY (email) REFERENCES users(email),
  image VARCHAR(64) NOT NULL,
  tag VARCHAR(64) NOT NULL,
  name VARCHAR(64) NOT NULL,
  auto_remove BOOLEAN NOT NULL,
  network_enabled BOOLEAN NOT NULL,
  command VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions(
  id SERIAL PRIMARY KEY,
  sessionid VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(64) NOT NULL,
  FOREIGN KEY (email) REFERENCES users(email)
);

CREATE TABLE IF NOT EXISTS images(
  id SERIAL PRIMARY KEY,
  image_tag VARCHAR(64) UNIQUE NOT NULL,
  commands VARCHAR(32)[] NOT NULL
);

INSERT INTO images(image_tag, commands) VALUES ('ubuntu:22.04', '{"/bin/bash", "/bin/sh"}');
INSERT INTO images(image_tag, commands) VALUES ('python:3.11', '{"/usr/bin/python3", "/bin/bash", "/usr/bin/sh"}');
INSERT INTO images(image_tag, commands) VALUES ('alpine:3.14', '{"/bin/sh"}');
INSERT INTO images(image_tag, commands) VALUES ('debian:stable', '{"/bin/bash","/bin/sh"}');
