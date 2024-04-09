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
  tag VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions(
  id SERIAL PRIMARY KEY,
  sessionid VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(64) NOT NULL,
  FOREIGN KEY (email) REFERENCES users(email)
);
