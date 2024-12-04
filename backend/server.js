const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// Increase the payload limit to 10mb to allow receiving all the Excel data
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

// Create a connection to the database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'db_portes_ouvertes_2024_etml'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

const adminPassword = 'password';

app.post('/api/adminLogin', (req, res) => {
    const { password } = req.body;
    if (password === adminPassword) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Endpoint to insert data
app.post('/api/insert', (req, res) => {
    const data = req.body;
    const values = data.map(item => [item.nom, item.classe, item.heure, item.presence, item.laboratoire]);

    const sql = 'INSERT INTO attendance (nom, classe, heure, presence, laboratoire) VALUES ?';
    db.query(sql, [values], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Error inserting data' });
        }
        res.status(200).json({ message: 'Data inserted successfully', result });
    });
});

// Endpoint to search for students
app.get('/api/search', (req, res) => {
    const { nom, prenom } = req.query;
    let sql = 'SELECT * FROM attendance WHERE 1=1';
    const values = [];

    if (nom) {
        sql += ' AND nom LIKE ?';
        values.push(`%${nom}%`);
    }

    if (prenom) {
        sql += ' AND nom LIKE ?';
        values.push(`%${prenom}%`);
    }

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error searching data:', err);
            return res.status(500).json({ error: 'Error searching data' });
        }
        res.status(200).json(results);
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
