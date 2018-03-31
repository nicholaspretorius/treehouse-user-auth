const express = require('express');

const router = express.Router();

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
  .post((req, res) => {
    res.render('thankyou', { title: 'Thank you' });
  });


module.exports = router;
