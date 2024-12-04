CREATE DATABASE attendance_db;

USE attendance_db;

CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    classe VARCHAR(255) NOT NULL,
    heure TIME NOT NULL,
    presence BOOLEAN NOT NULL,
    laboratoire VARCHAR(255) NOT NULL
);