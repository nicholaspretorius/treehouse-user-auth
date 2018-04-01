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

// authenticate user against db documents. Statics object lets you add function to the model
UserSchema.statics.authenticate = function authenticateUser(email, password, callback) {
  User.findOne({ email })
    .exec((error, user) => {
      if (error) {
        return callback(error);
      } else if (!user) {
        const err = new Error('User with that email not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, (bcryptError, result) => {
        if (result === true) {
          return callback(null, user);
        }
        return callback();
      });
    });
};

// hash password before saving to the db using mongoose pre-save hook
UserSchema.pre('save', function hashPassword(next) {
  const user = this; // this refers to object created by user on submission
  // params: password to be encrypted, 10 = no. times to encrypt, callback runs on hash complete
  bcrypt.hash(user.password, 10, (err, hash) => {
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

