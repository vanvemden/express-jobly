const db = require('../db');
const ExpressError = require('../helpers/expressError');
const partialUpdate = require('../helpers/partialUpdate');
const Job = require('./job');

/** Collection of related methods for companies. */

class Company {

  constructor({ handle, name, num_employees, description, logo_url }) {
    this.handle = handle;
    this.name = name;
    this.num_employees = num_employees;
    this.description = description;
    this.logo_url = logo_url;
  }

  // Get all companies, and provide optional filters for
  // company name and/or min/max number of employees.
  // Returns: [ company, company ]
  static async getAll({ search, min_employees, max_employees }) {
    let filters = [];
    let values = [];
    let query = `SELECT handle, name, num_employees, description, logo_url 
      FROM companies`;

    if (+(min_employees) > +(max_employees)) {
      throw new ExpressError('Invalid min-max query', 400);
    }

    if (search) {
      filters.push(`name LIKE $${filters.length + 1}`);
      values.push(`%${search}%`);
    }
    if (min_employees) {
      filters.push(`num_employees > $${filters.length + 1}`);
      values.push(min_employees);
    }
    if (max_employees) {
      filters.push(`num_employees < $${filters.length + 1}`);
      values.push(max_employees);
    }

    if (filters.length > 0) {
      query += ' WHERE ' + filters.join(' AND ');
    }

    try {
      const result = await db.query(`${query};`, values);
      return result.rows.map((c) => new Company(c));
    } catch {
      throw new ExpressError('Invalid search data.', 404);
    }

  }


  static async getById(handle) {
    const resultCompany = await db.query(
      `SELECT handle, name, num_employees, description, logo_url
        FROM companies 
        WHERE handle=$1;`,
      [handle]
    );

    const resultJobs = await db.query(
      `SELECT id, title, salary, equity, date_posted
      FROM jobs
      WHERE company_handle=$1;`,
      [handle]
    );

    if (resultCompany.rows.length === 0) {
      throw new ExpressError(`Company with handle '${handle}' does not exist.`, 404);
    }

    let company = new Company(resultCompany.rows[0]);
    company.jobs = resultJobs.rows.map((j) => new Job(j));
    return company;
  }

  // Create a new company .
  // Returns company instance object
  static async create({ handle, name, num_employees, description, logo_url }) {
    try {

      const result = await db.query(
        `INSERT INTO companies
        (handle, name, num_employees, description, logo_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING handle, name, num_employees, description, logo_url`,
        [handle, name, num_employees, description, logo_url]
      );
      return new Company(result.rows[0]);

    } catch {
      throw new ExpressError(`Company with handle '${handle}' does already exist.`, 400);
    }
  }

  static async update(handle, items) {
    try {
      const { query, values } = partialUpdate("companies", items, "handle", handle);
      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        throw new ExpressError(`Failed to update company '${handle}'`, 400);
      }

      return new Company(result.rows[0]);

    } catch {
      throw new ExpressError(`Invalid data for update.`, 400);
    }

  }

  static async delete(handle) {
    const result = await db.query(
      `DELETE FROM companies 
      WHERE handle=$1 
      RETURNING handle`,
      [handle]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Failed to delete company '${handle}'.`, 404);
    }

    return { message: "Company deleted" }
  }
}

module.exports = Company;
