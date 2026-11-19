process.env.DB_PATH = ':memory:';

const request = require('supertest');
const app = require('./index');
const { closeDb } = require('./db');

afterAll(() => closeDb());

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

  it('shows CHANGE from the environment in the top-right indicator', async () => {
    const previous = process.env.CHANGE;
    try {
      process.env.CHANGE = 'Variables OK';
      const res = await request(app).get('/');
      expect(res.text).toContain('class="change-indicator">CHANGE: Variables OK</div>');
      process.env.CHANGE = '<script>alert(1)</script>';
      const escaped = await request(app).get('/');
      expect(escaped.text).toContain('CHANGE: &lt;script&gt;alert(1)&lt;/script&gt;');
      expect(escaped.text).not.toContain('CHANGE: <script>');
    } finally {
      if (previous === undefined) delete process.env.CHANGE;
      else process.env.CHANGE = previous;
    }
  });

  describe('POST /api/quack', () => {
    it('saves a lyric and returns 201', async () => {
      const res = await request(app).post('/api/quack').send({ lyric: 'hello duck' });
      expect(res.status).toBe(201);
      expect(res.body.lyric).toBe('hello duck');
      expect(res.body.id).toBeDefined();
      expect(res.body.created_at).toBeDefined();
    });

    it('returns 400 for empty lyric', async () => {
      const res = await request(app).post('/api/quack').send({ lyric: '' });
      expect(res.status).toBe(400);
    });

    it('returns 400 for missing lyric', async () => {
      const res = await request(app).post('/api/quack').send({});
      expect(res.status).toBe(400);
    });

    it('trims and truncates lyric to 200 chars', async () => {
      const long = 'a'.repeat(300);
      const res = await request(app).post('/api/quack').send({ lyric: long });
      expect(res.status).toBe(201);
      expect(res.body.lyric.length).toBe(200);
    });
  });

  describe('GET /api/quacks', () => {
    it('returns quacks array and total', async () => {
      const res = await request(app).get('/api/quacks');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.quacks)).toBe(true);
      expect(typeof res.body.total).toBe('number');
    });

    it('total increases after a POST', async () => {
      const before = (await request(app).get('/api/quacks')).body.total;
      await request(app).post('/api/quack').send({ lyric: 'counting quack' });
      const after = (await request(app).get('/api/quacks')).body.total;
      expect(after).toBe(before + 1);
    });
  });
});
