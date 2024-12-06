# Installation

```
git clone https://github.com/eliottscherrer/StudentSearch-ETML.git
```

## Prérequis
- [Node JS 22.12.0 (LTS)](https://nodejs.org/en/download/package-manager)
- MySQL 5.7.11

## Backend
```bash
cd backend
```

Installez [UWamp](https://www.uwamp.com/fr/?page=download), lancez le serveur MySql depuis celui-ci puis connectez-vous.
```bash
cd 
mysql -u root -proot
```

Ensuite, créez la base de données et la table associée .
```
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
```

## Frontend
```
cd frontend
npm i
npm run dev
```
