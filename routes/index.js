const express = require('express');
const debug = require('debug')('app:index');
const bcrypt = require('bcrypt');

const router = express.Router();
const User = require('../models/user');
const mid = require('../middleware');

// GET /
router.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact' });
});

// GET /register
router.route('/register')
  .get(mid.loggedOut, (req, res) => {
    res.render('register', { title: 'Register' });
  })
  .post((req, res, next) => {
    // res.render('thankyou', { title: 'Thank you' });
    if (req.body.email &&
      req.body.name &&
      req.body.favoriteBook &&
      req.body.password &&
      req.body.confirmPassword) {
      // confirm that user typed same password
      if (req.body.password !== req.body.confirmPassword) {
        const err = new Error('Passwords do not match.');
        err.status = 400;
        next(err);
      }

      // create object from form input
      const userData = {
        email: req.body.email,
        name: req.body.name,
        favoriteBook: req.body.favoriteBook,
        password: req.body.password,
      };
      // use schema's 'create' method to inset document into Mongo
      User.create(userData, (err, user) => {
        if (err) {
          next(err);
        } else {
          req.session.userId = user._id;
          debug('User: ', user);
          debug('Session: ', req.session);
          res.redirect('/profile');
        }
      });
    } else {
      const err = new Error('All fields are required.');
      err.status = 400;
      next(err);
    }
  });

// login routes
router.route('/login')
  .get(mid.loggedOut, (req, res) => {
    res.render('login', { title: 'Log In' });
  })
  .post((req, res, next) => {
    if (req.body.email && req.body.password) {
      // assign login user details to object
      // const loginUser = {
      //   email: req.body.email,
      //   password: req.body.password,
      // };
      User.authenticate(req.body.email, req.body.password, (err, user) => {
        if (err || !user) {
          const error = new Error('Wrong email or password.');
          error.status = 401;
          next(error);
        } else {
          req.session.userId = user._id;
          debug('User: ', user);
          debug('Session: ', req.session);
          res.redirect('/profile');
        }
      });
      // find the login user
      // User.findOne({ email: loginUser.email }, (err, user) => {
      //   if (err) {
      //     next(err);
      //   } else {
      //     debug('Login user: ', user);
      //     // hash the login user password
      //     bcrypt.hash(loginUser.password, 10, (hashErr, hash) => {
      //       if (hashErr) {
      //         debug('Hashing error: ', hashErr);
      //         next(hashErr);
      //       }
      //       // do passwords match?
      //       debug('Hash: ', hash);
      //       if (hash === user.password) {
      //         // yes -> login
      //         res.redirect('/profile');
      //       } else {
      //         // no -> error
      //         const error = new Error('Incorrect password, please try again.');
      //         error.status = 401;
      //         next(error);
      //       }
      //     });
      //   }
      // });
    } else {
      const err = new Error('Email and password fields are required.');
      err.status = 401;
      next(err);
    }
  });

// get /profile
router.route('/profile')
  .get(mid.requiresLogin, (req, res, next) => {
    // if (!req.session.userId) {
    //   const err = new Error('You are not authorized to view this page.');
    //   err.status = 403; // forbidden
    //   next(err);
    // }
    User.findById(req.session.userId)
      .exec((error, user) => {
        if (error || !user) {
          next(error);
        } else {
          debug('Logged-in user: ', user);
          res.render('profile', {
            title: 'Profile',
            name: user.name,
            favorite: user.favoriteBook,
            email: user.email,
          });
        }
      });
  });

// GET /logout
router.route('/logout')
  .get((req, res, next) => {
    if (req.session) {
      // delete session object
      req.session.destroy((err) => {
        if (err) {
          next(err);
        } else {
          res.redirect('/');
        }
      });
    }
  });


module.exports = router;
