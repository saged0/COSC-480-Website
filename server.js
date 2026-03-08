const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const {
  getPool,
  isDatabaseConfigured,
  initializeDatabase,
  getDatabaseErrorDetails
} = require('./db');

dotenv.config();

const app = express();
const PORT = 3000;

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

// Use env-configurable credentials for demo auth.
const myusername = process.env.LOGIN_USERNAME || 'user1';
const mypassword = process.env.LOGIN_PASSWORD || 'mypassword';
const sessionSecret = process.env.SESSION_SECRET || 'change-this-session-secret';

// a variable to save a session
let session;

// session middleware
app.use(
  sessions({
    secret: sessionSecret,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(cookieParser());

app.get('/', (req, res) => {
  session = req.session;
  if (session.userid) {
    return res.redirect('/user');
  }

  return res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/user', (req, res) => {
  if (req.body.username === myusername && req.body.password === mypassword) {
    session = req.session;
    session.userid = req.body.username;
    console.log(req.session);
    return res.redirect('/user');
  }

  return res.redirect('/?loginError=1');
});

app.get('/user', (req, res) => {
  session = req.session;
  if (!session.userid) {
    return res.redirect('/');
  }

  return res.sendFile(path.join(__dirname, 'views', 'user.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send('Error while logging out');
    }

    return res.redirect('/');
  });
});

app.get('/lecture0-exercises', (req, res) => {
  res.sendFile(path.join(__dirname, 'lecture0_exercises.html'));
});

app.get('/api/notes', async (req, res) => {
  if (!isDatabaseConfigured()) {
    return res.status(503).json({ error: 'Database is not configured. Add .env values first.' });
  }

  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, content, created_at FROM notes ORDER BY id DESC'
    );

    return res.json(rows);
  } catch (error) {
    const details = getDatabaseErrorDetails(error);
    console.error('GET /api/notes failed:', details);

    return res.status(500).json({
      error: 'Failed to fetch notes',
      details
    });
  }
});

app.post('/api/notes', async (req, res) => {
  if (!isDatabaseConfigured()) {
    return res.status(503).json({ error: 'Database is not configured. Add .env values first.' });
  }

  const { content } = req.body;

  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'content is required' });
  }

  try {
    const pool = getPool();
    const [result] = await pool.execute('INSERT INTO notes (content) VALUES (?)', [content.trim()]);

    return res.status(201).json({ id: result.insertId, content: content.trim() });
  } catch (error) {
    const details = getDatabaseErrorDetails(error);
    console.error('POST /api/notes failed:', details);

    return res.status(500).json({
      error: 'Failed to create note',
      details
    });
  }
});

async function startServer() {
  if (isDatabaseConfigured()) {
    try {
      await initializeDatabase();
      console.log('MySQL connection ready.');
    } catch (error) {
      console.error('MySQL startup check failed:', getDatabaseErrorDetails(error));
    }
  } else {
    console.warn('Database is not configured. Add .env values to enable /api/notes.');
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();