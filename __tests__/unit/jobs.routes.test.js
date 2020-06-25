const request = require('supertest');
const app = require('../../app');
const db = require('../../db');



beforeEach(async () => {
  await db.query('DELETE FROM companies;');
  await db.query('DELETE FROM jobs');
  await db.query('ALTER SEQUENCE jobs_id_seq RESTART WITH 1')
  await db.query(
    `INSERT INTO companies 
    (handle, name, num_employees, description, logo_url)
    VALUES 
    ('appleinc', 'Apple Inc.', 1000, 'Creator of iPhone', 'http://apple.img'),
    ('ibm', 'IBM Inc.', 2000, 'Creator of IBM', 'http://ibm.img');`
  );
  await db.query(
    `INSERT INTO jobs
    (title, salary, equity, company_handle)
    VALUES
    ('Software Engineer', 150000, 0.1, 'appleinc'),
    ('Database Manager', 120000, 0.01, 'appleinc'),
    ('Server Room Manager', 70000, 0.00001, 'ibm');`
  );
});

afterAll(async () => {
  await db.end()
});

describe('Testing GET requests', () => {
  test('Should GET a list of ALL jobs', async () => {
    const response = await request(app).get('/jobs');

    expect(response.statusCode).toBe(200);
    expect(response.body.jobs).toHaveLength(3);
  });

  test('Should GET a list of jobs matching SEARCH params of Manager', async () => {
    const response = await request(app).get('/jobs?search=Manager');

    expect(response.statusCode).toBe(200);
    expect(response.body.jobs).toHaveLength(2);
  });

  test('Should GET a list of jobs with minimum salary of 130000', async () => {
    const response = await request(app).get('/jobs?min_salary=130000');

    expect(response.statusCode).toBe(200);
    expect(response.body.jobs).toHaveLength(1);
    expect(response.body.jobs[0].company_handle).toBe('appleinc');
  });

  test('Should GET a list of jobs with minimum equity of 0.01', async () => {
    const response = await request(app).get('/jobs?min_equity=0.01');

    expect(response.statusCode).toBe(200);
    expect(response.body.jobs).toHaveLength(1);
    expect(response.body.jobs[0].company_handle).toBe('appleinc');
  });

  test('Should GET a list of jobs with min. salary, min. equity, and search constraints', async () => {
    const response = await request(app).get(
      '/jobs?search=Engineer&min_salary=130000&min_equity=0.01'
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.jobs).toHaveLength(1);
    expect(response.body.jobs[0].company_handle).toBe('appleinc');
  });

  test('GET request with invalid data for min. equity and min. salary', async () => {
    const response = await request(app).get(
      '/jobs?min_salary=hundredthousand&min_equity=hello'
    );

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Invalid search data.");
  });

  test('GET request to /jobs/[id], return a job', async () => {
    const response = await request(app).get('/jobs/1');

    expect(response.statusCode).toBe(200);
    expect(response.body.job).toEqual({
      id: 1,
      title: 'Software Engineer',
      salary: 150000,
      equity: 0.1,
      company_handle: 'appleinc',
      date_posted: expect.any(String),
    });
  });

});

describe('Testing POST requests', () => {

  test('POST request to /jobs for adding new job', async () => {
    const resultPost = await request(app).post('/jobs').send({
      title: 'Testing Manager',
      salary: 170000,
      equity: 0.01,
      company_handle: 'ibm'
    });

    expect(resultPost.statusCode).toBe(201);
    expect(resultPost.body.job.title).toBe('Testing Manager');
    expect(resultPost.body.job.id).toBe(4);

    const resultGet = await request(app).get('/jobs/4');
    expect(resultGet.statusCode).toBe(200);
    expect(resultGet.body.job.title).toBe('Testing Manager');
  });

  test('POST request to /jobs with invalid data', async () => {
    const result = await request(app).post('/jobs').send({
      title: '',
      salary: 'alot',
      equity: 2,
      company_handle: 'ibm'
    });

    expect(result.statusCode).toBe(400);
    expect(result.body.message.length).toBeGreaterThan(0);
  });

  // Add testing: Make sure the company handle is valid

});

describe("Testing PATCH request", () => {

  test('PATCH request to /jobs for updating existing job', async () => {
    const resultPatch = await request(app).patch('/jobs/2').send({
      title: 'Database Manager',
      salary: 155000,
      equity: 0.015,
      company_handle: 'ibm'
    });

    expect(resultPatch.statusCode).toBe(200);
    expect(resultPatch.body.job.salary).toBe(155000);
    expect(resultPatch.body.job.equity).toBe(0.015);

    const resultGet = await request(app).get('/jobs/2');
    expect(resultGet.statusCode).toBe(200);
    expect(resultGet.body.job.salary).toBe(155000);
    expect(resultGet.body.job.equity).toBe(0.015);
  });

  test('PATCH request to /jobs with invalid data', async () => {
    const result = await request(app).patch('/jobs/2').send({
      title: 'Database Manager',
      salary: 'araise',
      equity: 0.015,
      company_handle: 'ibm'
    })

    expect(result.statusCode).toBe(400);
    expect(result.body.message.length).toBeGreaterThan(0);
  });

});

describe("Testing DELETE request", () => {

  test('DELETE request to existing job', async () => {
    const resultDelete = await request(app).delete('/jobs/2');

    expect(resultDelete.statusCode).toBe(200);
    expect(resultDelete.body.message).toBe('Job deleted');

    const resultGet = await request(app).get('/jobs/2');

    expect(resultGet.statusCode).toBe(404);
  });

});
