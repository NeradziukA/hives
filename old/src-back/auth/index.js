const db = require('../db');

exports.verifyCallback = (username, password, cb) => {
  db.users.findByUsername(username, function (err, user) {
    if (err) {
      return cb(err);
    }
    if (!user) {
      return cb(null, false);
    }
    if (user.password != password) {
      return cb(null, false);
    }
    return cb(null, user);
  });
};

exports.deserializeUser = (id, cb) => {
  db.users.findById(id, function (err, user) {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
};

exports.serializeUser = (user, cb) => {
  cb(null, user.id);
};

exports.isLogged = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).send('UNAUTHORIZED');
  }
  next();
};

exports.login = (passport, req, res, next) => {
  passport.authenticate('local', function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).send('UNAUTHORIZED');
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.status(202).send('LOGGED IN');
    });
  })(req, res, next);
};