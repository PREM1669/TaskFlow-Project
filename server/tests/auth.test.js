require('./setup');
const request = require('supertest');
const app = require('../app');

describe('Authentication', () => {
  it('registers a new user and returns a cookie', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('rejects duplicate email addresses', async () => {
    const payload = { name: 'Test', email: 'dup@example.com', password: 'password123' };
    await request(app).post('/api/auth/register').send(payload);
    const response = await request(app).post('/api/auth/register').send(payload);

    expect(response.status).toBe(409);
  });

  it('logs in with correct credentials and rejects a wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'login@example.com', password: 'password123' });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'password123' });
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'nope' });

    expect(login.status).toBe(200);
    expect(wrongPassword.status).toBe(401);
  });
});
