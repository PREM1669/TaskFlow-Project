require('./setup');
const request = require('supertest');
const app = require('../app');

const register = async () => {
  const agent = request.agent(app);
  await agent
    .post('/api/auth/register')
    .send({ name: 'Board Owner', email: 'owner@example.com', password: 'password123' });
  return agent;
};

describe('Boards and tasks', () => {
  it('creates a board with default columns and persists tasks', async () => {
    const agent = await register();
    const boardResponse = await agent
      .post('/api/boards')
      .send({ title: 'Product Launch' });

    expect(boardResponse.status).toBe(201);
    const board = boardResponse.body;
    const detailResponse = await agent.get(`/api/boards/${board._id}`);
    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.columns).toHaveLength(3);

    const taskResponse = await agent
      .post('/api/tasks')
      .send({
        boardId: board._id,
        columnId: detailResponse.body.columns[0]._id,
        title: 'Write release notes',
      });

    expect(taskResponse.status).toBe(201);
    const refreshed = await agent.get(`/api/boards/${board._id}`);
    expect(refreshed.body.tasks[0].title).toBe('Write release notes');
  });

  it('prevents unauthenticated board access', async () => {
    const response = await request(app).get('/api/boards');
    expect(response.status).toBe(401);
  });
});
