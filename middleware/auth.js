const { SECRET_KEY } = require('../config');
const jwt = require('jsonwebtoken');

function authenticateJWT(req, res, next) {
  try {
    let token = req.body._token;
    let payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
    return next();
  } catch (err) {
    return next();
  }
}

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return next({ status: 401, message: 'Unauthorized' });
  }
  return next();
}

function ensureSameUser(req, res, next) {
  if (req.user.username !== req.params.username) {
    return next({ status: 401, message: 'Unauthorized' });
  }
  return next();
}

function ensureIsAdmin(req, res, next) {
  if (!req.user.is_admin) {
    return next({ status: 401, message: 'Unauthorized' });
  }
  return next();
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureSameUser,
  ensureIsAdmin
};
