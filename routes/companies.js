const express = require('express');
const router = new express.Router();
const jsonschema = require("jsonschema");
const Company = require("../models/company");
const companySchema = require("../schemas/companySchema.json");

// GET '/companies/?search=..&min_employees=..&max_employees=..'
// Returns { companies: [...]}
router.get('/', async (req, res, next) => {
  try {
    // get all companies based on optional query value, return obj.
    const companies = await Company.getAll(req.query);
    return res.json({ companies });
  } catch (err) {
    next(err);
  }
});


// POST '/companies' 
// Returns { company: companyData }
router.post('/', async (req, res, next) => {
  try {
    // create a new company.
    const result = jsonschema.validate(req.body, companySchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map(err => err.stack);
      throw new ExpressError(listOfErrors, 400);
    }
    const company = await Company.create(req.body);
    return res.status(201).json({ company });
  } catch (err) {
    next(err);
  }
});

// GET '/companies/[handle]'
// Returns {company: companyData}
router.get('/:handle', async (req, res, next) => {
  try {
    // get single company by handle (id)
    const company = await Company.getById(req.params.handle);
    return res.json({ company });
  } catch (err) {
    next(err);
  }
})

// PATCH '/companies/[handle]'
// Returns {company: companyData}
router.patch('/:handle', async (req, res, next) => {
  try {
    // update existing company
    const result = jsonschema.validate(req.body, companySchema);
    if (!result.valid) {
      let listOfErrors = result.errors.map(err => err.stack);
      throw new ExpressError(listOfErrors, 400);
    }
    const company = await Company.update(req.params.handle, req.body);
    return res.json({ company });
  } catch (err) {
    next(err);
  }
})

// DELETE '/companies/[handle]'
// Returns {message: message}
router.delete('/:handle', async (req, res, next) => {
  try {
    // delete existing company by handle
    const message = await Company.delete(req.params.handle);
    return res.json(message);
  } catch (err) {
    next(err);
  }
});


module.exports = router;
