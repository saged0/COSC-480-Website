const express = require('express');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');

const app = express();
const PORT = 4000;

const myusername = process.env.LOGIN_USERNAME || 'user1';
const mypassword = process.env.LOGIN_PASSWORD || 'mypassword';
const sessionSecret = process.env.SESSION_SECRET || 'change-this-session-secret';

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

// session middleware
app.use(
  sessions({
    secret: sessionSecret,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
  })
);

// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serving public file
app.use(express.static(__dirname));

// cookie parser middleware
app.use(cookieParser());

// a variable to save a session
let session;

app.get('/', (req, res) => {
  session = req.session;
  if (session.userid) {
    res.send("Welcome User <a href='/logout'>click to logout</a>");
  } else {
    res.sendFile('views/index.html', { root: __dirname });
  }
});

app.post('/user', (req, res) => {
  if (req.body.username === myusername && req.body.password === mypassword) {
    session = req.session;
    session.userid = req.body.username;
    console.log(req.session);
    res.send("Hey there, welcome <a href='/logout'>click to logout</a>");
  } else {
    res.redirect('/?loginError=1');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server Running at port ${PORT}`);
});
