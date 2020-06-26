const request = require('supertest');
const app = require('../../app');
const db = require('../../db');



beforeEach(async () => {
  await db.query('DELETE FROM users');
  await db.query(
    `INSERT INTO users
    (username, password, first_name, last_name, email, photo_url, is_admin)
    VALUES
    ('user1', 'password1', 'First1', 'Last1', 'user1@example.com', 'photo1.jpg', true),
    ('user2', 'password2', 'First2', 'Last2', 'user2@example.com', 'photo2.jpg', false),
    ('user3', 'password3', 'First3', 'Last3', 'user3@example.com', 'photo3.jpg', false);`
  );
});

afterAll(async () => {
  await db.end()
});

describe('Testing GET requests', () => {

  test('Should GET a list of ALL users', async () => {
    const response = await request(app).get('/users');

    expect(response.statusCode).toBe(200);
    expect(response.body.users).toHaveLength(3);
  });

  test('GET request to /users/[username], return a user', async () => {
    const response = await request(app).get('/users/user1');

    expect(response.statusCode).toBe(200);
    expect(response.body.user).toEqual({
      username: 'user1',
      first_name: 'First1',
      last_name: 'Last1',
      email: 'user1@example.com',
      photo_url: 'photo1.jpg'
    });
  });

});

describe('Testing POST requests', () => {

  const newUser = {
    username: 'taco',
    first_name: 'Taco',
    last_name: 'Johnson',
    email: 'taco@example.com',
    photo_url: 'tacophoto.jpg'
  }
  const newUserWithPassword = { ...newUser, password: "secret" }

  test('POST request to /users for adding new user', async () => {
    const resultPost = await request(app).post('/users').send(newUserWithPassword);

    expect(resultPost.statusCode).toBe(201);
    expect(resultPost.body.user).toEqual(newUser);

    const resultGet = await request(app).get('/users/taco');
    expect(resultGet.statusCode).toBe(200);
    expect(resultGet.body.user).toEqual(newUser);
  });

  test('POST request to /users with invalid data', async () => {
    const result = await request(app).post('/users').send({
      username: 'user1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'taco@example.com',
      photo_url: 'tacophoto.jpg'
    });

    expect(result.statusCode).toBe(400);
    expect(result.body.message.length).toBeGreaterThan(0);
  });

  // Add testing: Make sure the company handle is valid

});

// describe("Testing PATCH request", () => {

//   test('PATCH request to /users for updating existing user', async () => {
//     const resultPatch = await request(app).patch('/users/user2').send({
//       username: 'user10',
//       first_name: 'Marco',
//       last_name: 'Polo',
//       email: 'marco_polo@example.com',
//       photo_url: 'photo2.jpg'
//     });

//     expect(resultPatch.statusCode).toBe(200);
//     expect(resultPatch.body.user.username).toBe('user10');
//     expect(resultPatch.body.user.last_name).toBe('Polo');

//     const resultGet = await request(app).get('/users/user10');
//     expect(resultGet.statusCode).toBe(200);
//     expect(resultPatch.body.user.email).toBe('marco_polo@example.com');
//     expect(resultPatch.body.user.last_name).toBe('Polo');
//   });

//   test('PATCH request to /users with invalid data', async () => {
//     const result = await request(app).patch('/users/anonymous').send({
//       username: 'anonymous',
//       first_name: 'Ano',
//       last_name: 'Nymous',
//       email: 'anonymous@example.com',
//       photo_url: 'photo102.jpg'
//     });

//     expect(result.statusCode).toBe(404);
//     expect(result.body.message.length).toBeGreaterThan(0);
//   });

// });

// describe("Testing DELETE request", () => {

//   test('DELETE request to existing user', async () => {
//     const resultDelete = await request(app).delete('/users/user1');

//     expect(resultDelete.statusCode).toBe(200);
//     expect(resultDelete.body.message).toBe('User deleted');

//     const resultGet = await request(app).get('/users/user1');

//     expect(resultGet.statusCode).toBe(404);
//   });

// });
