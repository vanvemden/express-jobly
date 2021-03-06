const express = require('express');
const router = new express.Router();
const jsonschema = require("jsonschema");
const Job = require("../models/job");
const jobSchema = require("../schemas/jobSchema.json");
const ExpressError = require('../helpers/expressError');
const { ensureIsAdmin } = require("../middleware/auth");


// POST '/jobs'
// Returns { job: jobData }
router.post('/', ensureIsAdmin, async (req, res, next) => {
  try {
    // create a new job
    const result = jsonschema.validate(req.body, jobSchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map(err => err.stack);
      throw new ExpressError(listOfErrors, 400);
    }
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
});


// GET '/jobs?search=..&min_salary=..&min_equity=..'
// Returns { jobs : [job, ..]} 
router.get('/', async (req, res, next) => {
  try {
    // get all jobs based on optional query values
    const jobs = await Job.getAll(req.query);
    return res.json({ jobs });
  } catch (err) {
    next(err);
  }
});

// GET /jobs/[id]
// Returns { job: jobData }
router.get('/:id', async (req, res, next) => {
  try {
    // get single job by id
    const job = await Job.getById(req.params.id);
    return res.json({ job });
  } catch (err) {
    next(err);
  }
});

// PATCH '/jobs/[id]'
// Returns { job : jobData }
router.patch('/:id', ensureIsAdmin, async (req, res, next) => {
  try {
    // update existing job by id
    const result = jsonschema.validate(req.body, jobSchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map(err => err.stack);
      throw new ExpressError(listOfErrors, 400);
    }
    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    next(err);
  }
});

// POST '/jobs/[id]/apply'
// Insert state into applications table
router.post('/:id/apply', async (req, res, next) => {
  try {

    const message = await Job.setState(req.params.id, req.user.username, req.body.state);
    return res.json(message);

  } catch (err) {
    next(err);
  }
})

// POST '/jobs/[id]/apply'
// Insert state into applications table
router.post('/:id/technology', async (req, res, next) => {
  try {

    const message = await Job.setTechnologies(req.params.id, req.body.technologies);
    return res.json(message);

  } catch (err) {
    next(err);
  }
})

// DELETE '/jobs/[id]'
// Returns { message: "Job deleted" }
router.delete('/:id', ensureIsAdmin, async (req, res, next) => {
  try {
    // delete an existing job listing by id.
    const message = await Job.delete(req.params.id);
    return res.json(message);
  } catch (err) {
    next(err);
  }
});


module.exports = router;