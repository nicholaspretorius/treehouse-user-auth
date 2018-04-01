const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const debug = require('debug')('app');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const app = express();
const port = process.env.PORT || 3000;

// mongodb connection
mongoose.connect('mongodb://localhost/bookworm');
const db = mongoose.connection;

// mongo error
db.on('error', console.error.bind(console, 'connection error'));

// use sessions for tracking logins
app.use(session({
  secret: 'bookworm app',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// make user id available in templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId;
  next();
});

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from /public
app.use(express.static(path.join(__dirname, '/public')));

// view engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));

// include routes
const routes = require('./routes/index');

app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
  next();
});

// listen on port 3000
app.listen(port, () => {
  debug('Express app listening on port 3000');
});
