CREATE DATABASE IF NOT EXISTS credentials;
USE credentials;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

INSERT IGNORE INTO users (username, password)
VALUES ('user1', 'mypassword');
