const db = require('../db');
const ExpressError = require('../helpers/expressError');
const partialUpdate = require('../helpers/partialUpdate');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require('../config');

/** Collection of related methods for user. */

class User {
  constructor({ username, first_name, last_name, email, photo_url }) {
    this.username = username;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.photo_url = photo_url;
    // this.is_admin = is_admin;
  }

  // Register a new user.
  // Return a new User instance.
  static async register({
    username,
    password,
    first_name,
    last_name,
    email,
    photo_url,
  }) {
    try {
      // Generate a hashed password with bcrypt.
      const hashedPwd = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      const result = await db.query(
        `INSERT INTO users 
        (username, password, first_name, last_name, email, photo_url, is_admin)
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING username, is_admin`,
        [username, hashedPwd, first_name, last_name, email, photo_url, false]
      );
      return jwt.sign(result.rows[0], SECRET_KEY);

    } catch {
      throw new ExpressError('Username/Email is already in use.', 400);
    }
  }

  static async authenticate({ username, password }) {
    const result = await db.query(
      `SELECT password, is_admin
      FROM users 
      WHERE username=$1`,
      [username]
    );

    let user = result.rows[0];
    if (user) {
      if (await bcrypt.compare(password, user.password) === true) {
        let token = jwt.sign({ username, is_admin: user.is_admin }, SECRET_KEY);
        return token;
      }
    }

    throw new ExpressError('Invalid username/password', 400);
  }

  // Get all of the users
  // Return an array of users [{User}, {User}, ...]
  static async getAll() {
    const result = await db.query(
      `SELECT username, first_name, last_name, email, photo_url
      FROM users`
    );

    // For each, create the user object, then delete the photo_url key.
    return result.rows.map((u) => {
      let user = new User(u);
      delete user.photo_url;
      return user;
    });
  }

  // Get a single user
  // Returns a User instance.
  static async getById(username) {
    const userResult = await db.query(
      `SELECT username, first_name, last_name, email, photo_url
      FROM users
      WHERE LOWER(username)=$1;`,
      [username.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      throw new ExpressError(`${username} does not exist.`, 404);
    }

    const jobsResult = await db.query(
      `SELECT j.title, j.salary, j.equity, j.date_posted, a.state, a.created_at
      FROM jobs AS j
      JOIN applications AS a
      ON j.id = a.job_id
      WHERE LOWER(a.username)=$1`,
      [username.toLowerCase()]
    );

    let user = new User(userResult.rows[0]);

    user.jobs = jobsResult.rows;

    return user;
  }

  // Updates user
  // Returns an updated User instance.
  static async update(username, items) {
    const { query, values } = partialUpdate(
      'users',
      items,
      'username',
      username
    );
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      throw new ExpressError(`User: ${username} could not be updated.`, 404);
    }

    return new User(result.rows[0]);
  }

  // Deletes user
  // Return { message }
  static async delete(username) {
    const result = await db.query(
      `DELETE FROM users
      WHERE username=$1
      RETURNING username`,
      [username]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Failed to delete user: ${username}.`, 404);
    }

    return { message: 'User deleted' };
  }
}

module.exports = User;
