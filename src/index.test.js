const request = require('supertest');
const app = require('./index');

describe('dancing-duck', () => {
  it('GET /healthz returns 200', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /ready returns 200', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
  });

  it('GET / returns HTML with dancing duck', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('Dancing Duck');
    expect(res.text).toContain('🦆');
  });
});
