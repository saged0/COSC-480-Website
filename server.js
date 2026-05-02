const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');

dotenv.config();

const {
  isDatabaseConfigured,
  initializeDatabase,
  authenticateUser,
  registerUser,
  getDatabaseErrorDetails
} = require('./db');
const models = require('./models');
const sequelizeQueries = require('./services/sequelizeQueries');

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
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.get('/', (req, res) => {
  session = req.session;
  if (session.userid) {
    return res.redirect('/user');
  }

  return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/user', async (req, res) => {
  if (!isDatabaseConfigured()) {
    return res.status(503).send('Database is not configured. Add .env DB values first.');
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).send('Missing username or password');
  }

  try {
    const user = await authenticateUser(username, password);
    if (!user) {
      return res.redirect('/?loginError=1');
    }

    session = req.session;
    session.userid = user.username;
    session.user_id = user.user_id;
    session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
      }
    });
    console.log('POST /user: session saved:', { userid: session.userid, user_id: session.user_id });
    return res.redirect('/user');
  } catch (error) {
    const details = getDatabaseErrorDetails(error);
    console.error('POST /user failed:', details);
    return res.status(500).send('Unable to process login right now.');
  }
});

app.post('/register', async (req, res) => {
  if (!isDatabaseConfigured()) {
    return res.status(503).send('Database is not configured. Add .env DB values first.');
  }

  const { username, password, passwordConfirm } = req.body || {};

  if (!username?.trim() || !password?.trim() || !passwordConfirm?.trim()) {
    return res.redirect('/register?registerError=missing');
  }

  if (password !== passwordConfirm) {
    return res.redirect('/register?registerError=nomatch');
  }

  try {
    const user = await registerUser(username, password);

    if (!user) {
      return res.redirect('/register?registerError=exists');
    }

    session = req.session;
    session.userid = user.username;
    session.user_id = user.user_id;
    session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
      }
    });
    console.log('POST /register: session saved:', { userid: session.userid, user_id: session.user_id });
    return res.redirect('/user');
  } catch (error) {
    const details = getDatabaseErrorDetails(error);
    console.error('POST /register failed:', details);
    return res.status(500).send('Unable to process registration right now.');
  }
});

app.get('/user', (req, res) => {
  session = req.session;
  if (!session.userid) {
    return res.redirect('/');
  }

  return res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

app.get('/register', (req, res) => {
  session = req.session;
  if (session.userid) {
    return res.redirect('/user');
  }

  return res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Ensure logged in helper — check req.session.user or fallback to req.session.userid
function ensureLoggedIn(req, res, next) {
  if (!req.session) return res.redirect('/');
  if (!req.session.user && req.session.userid) {
    req.session.user = req.session.userid;
  }

  if (!req.session.user) return res.redirect('/');
  return next();
}

async function resolveSessionUserId(req) {
  if (req.session?.user_id) {
    return req.session.user_id;
  }

  const username = req.session?.user || req.session?.userid;
  if (!username) {
    console.log('resolveSessionUserId: no username in session');
    return null;
  }

  try {
    const user = await models.User.findOne({
      attributes: ['user_id'],
      where: { username }
    });

    if (!user) {
      console.log('resolveSessionUserId: user not found for username:', username);
      return null;
    }

    req.session.user_id = user.user_id;
    await new Promise((resolve) => req.session.save(resolve));
    return user.user_id;
  } catch (err) {
    console.error('resolveSessionUserId error:', err);
    return null;
  }
}

async function debugSession(req) {
  console.log('DEBUG: req.session =', {
    user_id: req.session?.user_id,
    userid: req.session?.userid,
    id: req.session?.id,
    cookie: req.session?.cookie
  });
  console.log('DEBUG: req.headers.cookie =', req.headers.cookie);
}

app.get('/events', ensureLoggedIn, (req, res) => {
  return res.sendFile(path.join(__dirname, 'public', 'events.html'));
});

app.get('/events/:id', ensureLoggedIn, (req, res) => {
  return res.sendFile(path.join(__dirname, 'public', 'event-detail.html'));
});

app.get('/my-tickets', ensureLoggedIn, (req, res) => {
  return res.sendFile(path.join(__dirname, 'public', 'my-tickets.html'));
});

// API endpoint to save tickets purchased via the contract
app.post('/api/tickets', async (req, res) => {
  const { eventId, walletAddress, ticketId, txHash } = req.body || {};

  console.log('POST /api/tickets called');
  await debugSession(req);

  const userId = await resolveSessionUserId(req);

  if (!userId) {
    console.log('POST /api/tickets: NOT AUTHENTICATED');
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (!eventId || !walletAddress || !ticketId) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    console.log('POST /api/tickets: SAVING TICKET for userId =', userId);
    const rec = await sequelizeQueries.createTicket({
      eventId: parseInt(eventId, 10),
      userId,
      walletAddress,
      ticketId: ticketId.toString(),
      txHash: txHash || null
    });
    console.log('POST /api/tickets: SAVED ticket:', rec.id);

    return res.json({ success: true, ticket: rec });
  } catch (err) {
    console.error('Error saving ticket', err);
    return res.status(500).json({ error: 'server error' });
  }
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
  res.sendFile(path.join(__dirname, 'public', 'lecture0_exercises.html'));
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await sequelizeQueries.listEvents({ limit: 100 });
    return res.json({ events });
  } catch (error) {
    console.error('GET /api/events failed:', error);
    return res.status(500).json({ error: 'Unable to load events' });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await sequelizeQueries.getEventById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.json({ event });
  } catch (error) {
    console.error('GET /api/events/:id failed:', error);
    return res.status(500).json({ error: 'Unable to load event' });
  }
});

app.get('/api/tickets', async (req, res) => {
  const userId = await resolveSessionUserId(req);

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const tickets = await sequelizeQueries.listTicketsByUserId(userId);
    return res.json({ tickets });
  } catch (error) {
    console.error('GET /api/tickets failed:', error);
    return res.status(500).json({ error: 'Unable to load tickets' });
  }
});

async function startServer() {
  if (isDatabaseConfigured()) {
    try {
      await initializeDatabase();
      console.log('MySQL connection ready.');
    } catch (error) {
      console.error('MySQL startup check failed:', getDatabaseErrorDetails(error));
      process.exit(1)
    }
  } else {
    console.error('Database is not configured. Add .env values to enable DB-backed login.');
    process.exit(1)
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();