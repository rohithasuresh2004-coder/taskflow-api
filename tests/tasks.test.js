const request = require('supertest');
const app = require('../src/app');

const register = async (email) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test User', email, password: 'secret123' });
  return res.body.token;
};

describe('Tasks API', () => {
  let token;
  beforeEach(async () => {
    token = await register('owner@example.com');
  });

  const auth = (req) => req.set('Authorization', `Bearer ${token}`);

  test('rejects unauthenticated access', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  test('creates a task', async () => {
    const res = await auth(request(app).post('/api/tasks')).send({
      title: 'Write report', priority: 'high',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.task.title).toBe('Write report');
    expect(res.body.data.task.status).toBe('todo');
  });

  test('validates task input', async () => {
    const res = await auth(request(app).post('/api/tasks')).send({
      title: '', status: 'invalid',
    });
    expect(res.status).toBe(400);
  });

  test('lists tasks with filter and pagination', async () => {
    await auth(request(app).post('/api/tasks')).send({ title: 'A', status: 'done' });
    await auth(request(app).post('/api/tasks')).send({ title: 'B' });
    const res = await auth(request(app).get('/api/tasks?status=done&limit=5'));
    expect(res.status).toBe(200);
    expect(res.body.results).toBe(1);
    expect(res.body.pagination.total).toBe(1);
  });

  test('gets, updates and deletes a task', async () => {
    const created = await auth(request(app).post('/api/tasks')).send({ title: 'Old' });
    const id = created.body.data.task._id;

    const get = await auth(request(app).get(`/api/tasks/${id}`));
    expect(get.status).toBe(200);

    const upd = await auth(request(app).put(`/api/tasks/${id}`)).send({
      title: 'New', status: 'in-progress',
    });
    expect(upd.status).toBe(200);
    expect(upd.body.data.task.title).toBe('New');
    expect(upd.body.data.task.status).toBe('in-progress');

    const del = await auth(request(app).delete(`/api/tasks/${id}`));
    expect(del.status).toBe(204);

    const again = await auth(request(app).get(`/api/tasks/${id}`));
    expect(again.status).toBe(404);
  });

  test('returns 400 for an invalid id', async () => {
    const res = await auth(request(app).get('/api/tasks/not-an-id'));
    expect(res.status).toBe(400);
  });

  test("users cannot access another user's tasks", async () => {
    const created = await auth(request(app).post('/api/tasks')).send({ title: 'Private' });
    const id = created.body.data.task._id;

    const otherToken = await register('other@example.com');
    const res = await request(app)
      .get(`/api/tasks/${id}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(404);
  });

  test('unknown route returns 404 JSON', async () => {
    const res = await request(app).get('/api/nothing');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('fail');
  });
});
