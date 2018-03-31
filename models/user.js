const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const debug = require('debug')('app:user');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  favoriteBook: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// hash password before saving to the db.  mongoose gives a pre-save hook
UserSchema.pre('save', function(next) {
  const user = this; // this refers to object created by user on submission
  // params are the password to be encrypted, 10 is the number of times to run encryption, callback to run once hash complete
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      debug(err);
      next(err);
    } 
    user.password = hash;
    next();
  });
});

const User = mongoose.model('User', UserSchema);

module.exports = User;

