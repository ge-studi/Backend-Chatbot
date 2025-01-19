const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database('./chatbot.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Database connected!');
        db.run(`
            CREATE TABLE IF NOT EXISTS responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query TEXT UNIQUE,
                response TEXT
            )
        `);
        db.run(`
            INSERT OR IGNORE INTO responses (query, response)
            VALUES 
            ('hello', 'Hello! How can I assist you today?'),
            ('how are you', 'I am just a bot, but I am here to help!'),
            ('how is weather today', 'It is good'),
            ('default', 'Sorry, I do not understand that.');
        `);
    }
});

// Add a new query-response pair
app.post('/api/add-response', (req, res) => {
    const { query, response } = req.body;
    if (!query || !response) {
        return res.status(400).json({ error: 'Both query and response are required.' });
    }
    db.run(
        `INSERT OR REPLACE INTO responses (query, response) VALUES (?, ?)` ,
        [query.toLowerCase(), response],
        (err) => {
            if (err) {
                return res.status(500).send('Database error.');
            }
            res.json({ message: 'Response added or updated successfully!' });
        }
    );
});

// Fetch a specific response
app.get('/api/message', (req, res) => {
    const query = req.query.query?.toLowerCase();
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required.' });
    }

    db.get(
        `SELECT response FROM responses WHERE LOWER(query) = ?`,
        [query],
        (err, row) => {
            if (err) {
                return res.status(500).send('Database error.');
            }
            res.json({
                response: row ? row.response : 'Sorry, I do not understand that.',
            });
        }
    );
});

// Fetch all responses
app.get('/api/responses', (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;
    db.all(`SELECT * FROM responses LIMIT ? OFFSET ?`, [limit, offset], (err, rows) => {
        if (err) {
            return res.status(500).send('Database error.');
        }
        res.json(rows);
    });
});

// Add a route for the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the chatbot API!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
