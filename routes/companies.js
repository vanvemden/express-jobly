const express = require('express');
const router = new express.Router();

// GET '/companies/?search=..&min_employees=..&max_employees=..'
// Returns { companies: [...]}
router.get('/', (req, res, next) => {
  try {
    // get all companies based on optional query value, return obj.
    const companies = Company.getAll(req.query);
    return res.json({ companies });
  } catch (err) {
    next(err);
  }
});


// POST '/companies' 
// Returns { company: companyData }
router.post('/', (req, res, next) => {
  try {
    // create a new company.
    const company = Company.create(req.body);
    return res.status(201).json({ company });
  } catch (err) {
    next(err);
  }
});

// GET '/companies/[handle]'
// Returns {company: companyData}
router.get('/:handle', (req, res, next) => {
  try {
    // get single company by handle (id)
    const company = Company.getById(req.params.handle);
    return res.json({ company });
  } catch (err) {
    next(err);
  }
})

// PATCH '/companies/[handle]'
// Returns {company: companyData}
router.patch('/:handle', (req, res, next) => {
  try {
    // update existing company
    const company = Company.update(req.params.handle, req.body);
    return res.json({ company });
  } catch (err) {
    next(err);
  }
})

// DELETE '/companies/[handle]'
// Returns {message: message}
router.delete('/:handle', (req, res, next) => {
  try {
    // delete existing company by handle
    const message = Company.delete(req.params.handle);
    return res.json({ message });
  } catch (err) {
    next(err);
  }
});


module.exports = router;
