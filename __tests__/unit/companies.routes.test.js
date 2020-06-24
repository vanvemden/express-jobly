const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

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

describe('Test companies routes', () => {

  test('GET / - list of all companies.', async () => {
    const response = await request(app).get('/companies');
    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toHaveLength(2);
  });

  test("GET / - list of companies with name search for 'ppl'.", async () => {
    const response = await request(app).get('/companies?search=ppl');
    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toHaveLength(1);
    expect(response.body.companies[0].handle).toBe('appleinc');
  });

  test('GET / - list of companies with num_employees > 1000.', async () => {
    const response = await request(app).get('/companies?min_employees=1000');
    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toHaveLength(1);
    expect(response.body.companies[0].handle).toBe('ibm');
  });

  test('GET / - list of companies with num_employees < 2000.', async () => {
    const response = await request(app).get('/companies?max_employees=2000');
    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toHaveLength(1);
    expect(response.body.companies[0].handle).toBe('appleinc');
  });

  test('GET / - list of companies with 500 < num_employees < 2500.', async () => {
    const response = await request(app).get(
      '/companies?min_employees=500&max_employees=2500'
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toHaveLength(2);
  });

  test('POST / - add a new company.', async () => {
    const responsePost = await request(app).post('/companies').send({
      handle: 'tesla',
      name: 'Tesla',
      num_employees: 10000,
      description: 'Creator of cool cars',
      logo_url: 'http://tesla.img/',
      _token: 'wheeeeeee'
    });
    expect(responsePost.statusCode).toBe(201);
    expect(responsePost.body.company.handle).toBe('tesla');

    const responseGet = await request(app).get('/companies/tesla');
    expect(responseGet.statusCode).toBe(200);
    expect(responseGet.body.company.handle).toBe('tesla');
  });

  test('PATCH /:handle - update a company.', async () => {
    const responsePatch = await request(app).patch('/companies/appleinc').send({
      handle: 'appleinc',
      name: 'Apple Inc.',
      num_employees: 1500,
      description: 'Creator of iPhone',
      logo_url: 'http://apple.img/',
      _token: 'wheeeeeee'
    });
    expect(responsePatch.statusCode).toBe(200);
    expect(responsePatch.body.company.handle).toBe('appleinc');

    const responseGet = await request(app).get('/companies/appleinc');
    expect(responseGet.statusCode).toBe(200);
    expect(responseGet.body.company.num_employees).toBe(1500);
  });

  test('Delete /:handle - delete a company.', async () => {
    const responseDelete = await request(app).delete('/companies/appleinc');
    expect(responseDelete.statusCode).toBe(200);
    expect(responseDelete.body.message).toBe('Company deleted');

    const responseGet = await request(app).get('/companies/appleinc');
    expect(responseGet.statusCode).toBe(404);
  })
});
