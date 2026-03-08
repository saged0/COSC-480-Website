const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const {
  isDatabaseConfigured,
  initializeDatabase,
  authenticateUser,
  getDatabaseErrorDetails
} = require('./db');

dotenv.config();

const app = express();
const PORT = 3000;

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

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

app.post('/user', async (req, res) => {
  if (!isDatabaseConfigured()) {
    return res.status(503).send('Database is not configured. Add .env DB values first.');
  }

  const { username, password } = req.body;

  try {
    const user = await authenticateUser(username, password);
    if (!user) {
      return res.redirect('/?loginError=1');
    }

    session = req.session;
    session.userid = user.username;
    console.log(req.session);
    return res.redirect('/user');
  } catch (error) {
    const details = getDatabaseErrorDetails(error);
    console.error('POST /user failed:', details);
    return res.status(500).send('Unable to process login right now.');
  }
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

async function startServer() {
  if (isDatabaseConfigured()) {
    try {
      await initializeDatabase();
      console.log('MySQL connection ready.');
    } catch (error) {
      console.error('MySQL startup check failed:', getDatabaseErrorDetails(error));
    }
  } else {
    console.warn('Database is not configured. Add .env values to enable DB-backed login.');
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();