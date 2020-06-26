const request = require('supertest');
const app = require('../../app');
const db = require('../../db');
const User = require('../../models/user');

// Global token for admin authentication
let _token;

beforeAll(async () => {
  await db.query('DELETE FROM users');
  await User.register({
    username: "admin",
    password: "secret",
    first_name: "admin_first",
    last_name: "admin_last",
    email: "admin@example.com",
    photo_url: "2424234.jpg"
  });
  await db.query(
    `UPDATE users 
    SET is_admin = true 
    WHERE username='admin'`
  );
  _token = await User.authenticate({ username: "admin", password: "secret" });
  console.log('token.........................', _token);
});

beforeEach(async () => {
  await db.query('DELETE FROM companies;');
  await db.query(
    `INSERT INTO companies 
    (handle, name, num_employees, description, logo_url)
    VALUES 
    ('appleinc', 'Apple Inc.', 1000, 'Creator of iPhone', 'http://apple.img'),
    ('ibm', 'IBM Inc.', 2000, 'Creator of IBM', 'http://ibm.img');`
  );
});

afterAll(async () => {
  await db.end()
});

describe('Test GET companies routes', () => {

  test('GET / - list of all companies.', async () => {
    const response = await request(app).get('/companies').send({ _token });
    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toHaveLength(2);
  });

  test("GET / - list of companies with name search for 'ppl'.", async () => {
    const response = await request(app).get('/companies?search=ppl').send({ _token });
    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toHaveLength(1);
    expect(response.body.companies[0].handle).toBe('appleinc');
  });

  test('GET / - list of companies with num_employees > 1000.', async () => {
    const response = await request(app).get('/companies?min_employees=1000').send({ _token });
    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toHaveLength(1);
    expect(response.body.companies[0].handle).toBe('ibm');
  });

  test('GET / - list of companies with num_employees < 2000.', async () => {
    const response = await request(app).get('/companies?max_employees=2000').send({ _token });
    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toHaveLength(1);
    expect(response.body.companies[0].handle).toBe('appleinc');
  });

  test('GET / - list of companies with 500 < num_employees < 2500.', async () => {
    const response = await request(app).get(
      '/companies?min_employees=500&max_employees=2500'
    ).send({ _token });
    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toHaveLength(2);
  });

});

describe('Test POST routes for companies', () => {

  test('POST / - add a new company.', async () => {
    const responsePost = await request(app).post('/companies').send({
      handle: 'tesla',
      name: 'Tesla',
      num_employees: 10000,
      description: 'Creator of cool cars',
      logo_url: 'http://tesla.img/',
      _token: _token
    });
    expect(responsePost.statusCode).toBe(201);
    expect(responsePost.body.company.handle).toBe('tesla');

    const responseGet = await request(app).get('/companies/tesla').send({ _token });
    expect(responseGet.statusCode).toBe(200);
    expect(responseGet.body.company.handle).toBe('tesla');
  });

  test('POST / - add a new company with invalid data', async () => {
    const response = await request(app).post('/companies').send({
      handle: '',
      name: 'Tesla',
      num_employees: 'thousand',
      description: 'Creator of cool cars',
      logo_url: 'http://tesla.img/',
      _token: _token
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message.length).toBeGreaterThan(0);
  });

});

describe('Test PATCH routes for companies', () => {

  test('PATCH /:handle - update a company.', async () => {
    const responsePatch = await request(app).patch('/companies/appleinc').send({
      handle: 'appleinc',
      name: 'Apple Inc.',
      num_employees: 1500,
      description: 'Creator of iPhone',
      logo_url: 'http://apple.img/',
      _token: _token
    });
    expect(responsePatch.statusCode).toBe(200);
    expect(responsePatch.body.company.handle).toBe('appleinc');

    const responseGet = await request(app).get('/companies/appleinc').send({ _token });
    expect(responseGet.statusCode).toBe(200);
    expect(responseGet.body.company.num_employees).toBe(1500);
  });

  test('PATCH /:handle - update a company with invalid data', async () => {
    const response = await request(app).patch('/companies/appleinc').send({
      handle: 'ibm',
      name: 'Apple Inc.',
      num_employees: 1500,
      description: 'Creator of iPhone',
      logo_url: 'http://apple.img/',
      _token: _token
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBeDefined();
  });

});

describe('Test DELETE routes for companies', () => {

  test('Delete /:handle - delete a company.', async () => {
    const responseDelete = await request(app).delete('/companies/appleinc').send({ _token });
    expect(responseDelete.statusCode).toBe(200);
    expect(responseDelete.body.message).toBe('Company deleted');

    const responseGet = await request(app).get('/companies/appleinc').send({ _token });
    expect(responseGet.statusCode).toBe(404);
  });

});
