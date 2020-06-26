const express = require('express');
const router = new express.Router();
const jsonschema = require("jsonschema");
const User = require("../models/user");
const userSchema = require("../schemas/userSchema.json");
const ExpressError = require('../helpers/expressError');
const { ensureSameUser } = require('../middleware/auth');


// POST '/users'
// Returns { user: userData }
router.post('/', async (req, res, next) => {
  try {
    // create a new user
    const result = jsonschema.validate(req.body, userSchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map(err => err.stack);
      throw new ExpressError(listOfErrors, 400);
    }
    const token = await User.register(req.body);
    return res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
});


// GET '/users'
// Returns { users : [user, ..]} 
router.get('/', async (req, res, next) => {
  try {
    // get all users
    const users = await User.getAll();
    return res.json({ users });
  } catch (err) {
    next(err);
  }
});

// GET /users/[username]
// Returns { user: userData }
router.get('/:username', async (req, res, next) => {
  try {
    // get single user by id
    const user = await User.getById(req.params.username);
    return res.json({ user });
  } catch (err) {
    next(err);
  }
});

// PATCH '/users/[username]'
// Returns { user : userData }
router.patch('/:username', ensureSameUser, async (req, res, next) => {
  try {
    // update existing user by username
    const result = jsonschema.validate(req.body, userSchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map(err => err.stack);
      throw new ExpressError(listOfErrors, 400);
    }
    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    next(err);
  }
});

// DELETE '/users/[username]'
// Returns { message: "user deleted" }
router.delete('/:username', ensureSameUser, async (req, res, next) => {
  try {
    // delete an existing user listing by id.
    const message = await User.delete(req.params.username);
    return res.json(message);
  } catch (err) {
    next(err);
  }
});


module.exports = router;