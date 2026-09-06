const request = require('supertest');
const app = require('../src/app');
const demoData = require('../../sample_data/demo_dataset.json');

describe('Student Misconception Radar - Developer 2 Backend API Suite', () => {
  const facultyToken = 'Bearer mock-faculty-token-01';
  const otherFacultyToken = 'Bearer faculty-9999-other-user';
  let createdAnalysisId = null;

  describe('1. Health Check Endpoints', () => {
    it('should return 200 OK on /health', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('student-misconception-radar-backend');
    });

    it('should return 200 OK on /api/health', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('2. Authentication & Authorization Middleware', () => {
    it('should reject POST /api/analyses without Authorization header with 401', async () => {
      const res = await request(app)
        .post('/api/analyses')
        .send({
          questionText: 'Test question',
          answers: ['Answer 1', 'Answer 2']
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject GET /api/analyses/:id without Authorization header with 401', async () => {
      const res = await request(app).get('/api/analyses/some-id');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject GET /api/analyses without Authorization header with 401', async () => {
      const res = await request(app).get('/api/analyses');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid or expired token with 401', async () => {
      const res = await request(app)
        .post('/api/analyses')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          questionText: 'Test question',
          answers: ['Answer 1', 'Answer 2']
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/invalid|expired/i);
    });
  });

  describe('3. Input Validation (Zod Middleware)', () => {
    it('should reject request with missing questionText with 400', async () => {
      const res = await request(app)
        .post('/api/analyses')
        .set('Authorization', facultyToken)
        .send({
          answers: ['Answer 1', 'Answer 2']
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/questionText is required/i);
    });

    it('should reject request with too short questionText with 400', async () => {
      const res = await request(app)
        .post('/api/analyses')
        .set('Authorization', facultyToken)
        .send({
          questionText: 'Hi',
          answers: ['Answer 1', 'Answer 2']
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/at least 5 characters/i);
    });

    it('should reject request with fewer than 2 student answers with 400', async () => {
      const res = await request(app)
        .post('/api/analyses')
        .set('Authorization', facultyToken)
        .send({
          questionText: 'Explain recursion and its components.',
          answers: ['Only one answer']
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/at least 2 student answers/i);
    });
  });

  describe('4. Contract A API Implementation', () => {
    it('should successfully create an analysis on POST /api/analyses matching exact Contract A shape', async () => {
      const payload = {
        questionText: demoData.question.text,
        clos: demoData.clos.map(c => c.description),
        answers: demoData.submissions.map(s => s.answer_text)
      };

      const res = await request(app)
        .post('/api/analyses')
        .set('Authorization', facultyToken)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('misconceptionGroups');
      expect(res.body).toHaveProperty('insight');
      expect(res.body).toHaveProperty('intervention');
      expect(res.body).toHaveProperty('createdAt');

      // Verify misconceptionGroups structure
      expect(Array.isArray(res.body.misconceptionGroups)).toBe(true);
      expect(res.body.misconceptionGroups.length).toBeGreaterThanOrEqual(2);

      const totalPercentage = res.body.misconceptionGroups.reduce(
        (sum, group) => sum + group.percentage,
        0
      );
      expect(totalPercentage).toBeCloseTo(100, 0);

      res.body.misconceptionGroups.forEach(group => {
        expect(group).toHaveProperty('label');
        expect(typeof group.label).toBe('string');
        expect(group).toHaveProperty('percentage');
        expect(typeof group.percentage).toBe('number');
      });

      expect(typeof res.body.insight).toBe('string');
      expect(res.body.insight.length).toBeGreaterThan(10);

      expect(typeof res.body.intervention).toBe('string');
      expect(res.body.intervention.length).toBeGreaterThan(10);

      createdAnalysisId = res.body.id;
    });

    it('should retrieve analysis by ID on GET /api/analyses/:id matching Contract A shape', async () => {
      expect(createdAnalysisId).toBeDefined();

      const res = await request(app)
        .get(`/api/analyses/${createdAnalysisId}`)
        .set('Authorization', facultyToken);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdAnalysisId);
      expect(res.body).toHaveProperty('misconceptionGroups');
      expect(res.body).toHaveProperty('insight');
      expect(res.body).toHaveProperty('intervention');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('should return 404 for non-existent analysis ID', async () => {
      const res = await request(app)
        .get('/api/analyses/non-existent-uuid')
        .set('Authorization', facultyToken);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('should list analyses on GET /api/analyses', async () => {
      const res = await request(app)
        .get('/api/analyses')
        .set('Authorization', facultyToken);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('misconceptionGroups');
      expect(res.body[0]).toHaveProperty('insight');
      expect(res.body[0]).toHaveProperty('intervention');
    });

    it('should isolate faculty data under RLS (another faculty cannot access)', async () => {
      const res = await request(app)
        .get(`/api/analyses/${createdAnalysisId}`)
        .set('Authorization', otherFacultyToken);

      expect(res.status).toBe(404);
    });
  });
});
