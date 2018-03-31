const express = require('express');
const debug = require('debug')('app:index');

const router = express.Router();
const User = require('../models/user');

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
  .get((req, res) => {
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
          debug(user);
          res.redirect('/profile');
        }
      });
    } else {
      const err = new Error('All fields are required.');
      err.status = 400;
      next(err);
    }
  });


module.exports = router;
