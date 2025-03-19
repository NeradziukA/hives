const WebSocketServer = new require('ws');
const path = require('path');
const express = require('express');
const https = require('https');
const expressSession = require('express-session');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const onWSConnect = require('./socket');
const auth = require('./auth');
const pem = require('pem');
const app = express();

console.log(`Running in environment: ${process.env.NODE_ENV}`);

passport.use(new Strategy(auth.verifyCallback));
passport.serializeUser(auth.serializeUser);
passport.deserializeUser(auth.deserializeUser);

app.use(require('morgan')('combined'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(expressSession({
  secret: 'LKJHlkjasdkjhew9832988u98*99<',
  resave: false,
  saveUninitialized: false,
  name: 'id',
  cookie: {
    maxAge: 600000
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.static(path.join(__dirname, '../src-front')));

app.post('/login',
  (req, res) => {
    auth.login(passport, req, res)
  });

app.post('/logout',
  (req, res) => {
    req.logout();
    res.status(200).send('LOGGED OUT');
  });

app.use('/api', auth.isLogged, (req, res) => {
  res.status(200).send('ACCEPTED');
});

pem.createCertificate({days:1, selfSigned:true}, function(err, keys){
  if (err) {
    return console.log(err);
  }
  const server = https.createServer({key: keys.serviceKey, cert: keys.certificate}, app).listen(8081);

  // WebSocket-сервер на порту 8081
  const webSocketServer = new WebSocketServer.Server({server: server});
  webSocketServer.on('connection', onWSConnect);

});