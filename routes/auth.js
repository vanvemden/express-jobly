const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const ExpressError = require("../helpers/expressError");

// POST '/login'
// Route for user login
router.post('/login', async (req, res, next) => {
  try {
    const token = await User.authenticate(req.body);
    return res.json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;