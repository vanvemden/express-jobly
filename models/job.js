const db = require('../db');
const ExpressError = require('../helpers/expressError');
const partialUpdate = require('../helpers/partialUpdate');

/** Collection of related methods for jobs. */

class Job {
  constructor({ id, title, salary, equity, company_handle, date_posted }) {
    this.id = id;
    this.title = title;
    this.salary = salary;
    this.equity = equity;
    this.company_handle = company_handle;
    this.date_posted = date_posted;
  }

  // Create a new job listing.
  // Returns Job instance object
  static async create({ title, salary, equity, company_handle }) {
    try {
      const result = await db.query(
        `INSERT INTO jobs 
                (title, salary, equity, company_handle)
                VALUES ($1, $2, $3, $4) 
                RETURNING id, title, salary, equity, company_handle, date_posted`,
        [title, salary, equity, company_handle]
      );

      return new Job(result.rows[0]);
    } catch {
      throw new ExpressError(`No company with handle '${company_handle}'`, 400);
    }
  }

  // Get all jobs, and provide optional filters for
  // job title and/or min salary and/or min equity
  // Returns: [ Job, Job, ...]
  static async getAll({ search, min_salary, min_equity }) {
    let filters = [];
    let values = [];
    let query = `SELECT id, title, salary, equity, company_handle, date_posted 
      FROM jobs`;

    if (search) {
      filters.push(`title LIKE $${filters.length + 1}`);
      values.push(`%${search}%`);
    }
    if (min_salary) {
      filters.push(`salary > $${filters.length + 1}`);
      values.push(min_salary);
    }
    if (min_equity) {
      filters.push(`equity > $${filters.length + 1}`);
      values.push(min_equity);
    }

    if (filters.length > 0) {
      query += ' WHERE ' + filters.join(' AND ');
    }

    const result = await db.query(`${query};`, values);

    return result.rows.map((j) => new Job(j));
  }

  static async getById(id) {
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle, date_posted
      FROM jobs
      WHERE id=$1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`No job found with id ${id}.`, 404);
    }

    return new Job(result.rows[0]);
  }

  static async update(id, items) {
    const { query, values } = partialUpdate('jobs', items, 'id', id);
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      throw new ExpressError(`Job with id ${id} could not be updated.`, 404);
    }

    return new Job(result.rows[0]);
  }

  static async delete(id) {
    const result = await db.query(
      `DELETE FROM jobs
      WHERE id=$1 
      RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Failed to delete job with id ${id}.`, 404);
    }

    return { message: 'Job deleted' };
  }
}

module.exports = Job;
