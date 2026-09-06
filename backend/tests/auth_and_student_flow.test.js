const request = require('supertest');
const app = require('../src/app');

describe('Role-Based Auth, Password Constraints & Student Feedback Portal Suite', () => {
  let facultyToken = null;
  let studentToken = null;
  let courseId = null;
  let examId = null;
  let questionId = null;

  describe('1. Password Constraints & Validation', () => {
    it('should reject password with less than 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Professor John',
          email: 'john@aust.edu',
          password: 'Pass1!',
          role: 'faculty'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/at least 8 characters/i);
    });

    it('should reject password without uppercase letter', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Professor John',
          email: 'john@aust.edu',
          password: 'password123!',
          role: 'faculty'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/uppercase/i);
    });

    it('should reject password without number', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Professor John',
          email: 'john@aust.edu',
          password: 'Password!',
          role: 'faculty'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/number/i);
    });

    it('should reject password without special character', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Professor John',
          email: 'john@aust.edu',
          password: 'Password123',
          role: 'faculty'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/special character/i);
    });

    it('should reject student registration without student ID or semester', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Student Mark',
          email: 'mark@aust.edu',
          password: 'StrongPass123!@#',
          role: 'student'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Student ID Number and Semester/i);
    });

    it('should reject invalid role', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Admin User',
          email: 'admin@aust.edu',
          password: 'StrongPass123!@#',
          role: 'superadmin'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/role/i);
    });
  });

  describe('2. Registration and Authentication', () => {
    it('should register a faculty user with strong password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Dr. Sarah Connor',
          email: 'sarah.faculty@aust.edu',
          password: 'FacultySecret2026!#',
          role: 'faculty',
          department: 'Department of CSE'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('faculty');
      expect(res.body.user.email).toBe('sarah.faculty@aust.edu');

      facultyToken = `Bearer ${res.body.token}`;
    });

    it('should register a student user with Student ID number and Semester', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alex Rivera',
          email: 'alex.student@aust.edu',
          studentId: '20210104001',
          semester: 'Fall 2026',
          password: 'StudentSecret2026!#',
          role: 'student'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('student');
      expect(res.body.user.studentId).toBe('20210104001');
      expect(res.body.user.semester).toBe('Fall 2026');

      studentToken = `Bearer ${res.body.token}`;
    });

    it('should login faculty with valid email credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'sarah.faculty@aust.edu',
          password: 'FacultySecret2026!#'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('faculty');
    });

    it('should login student using Student ID Number and password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          studentId: '20210104001',
          semester: 'Fall 2026',
          password: 'StudentSecret2026!#',
          role: 'student'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('student');
      expect(res.body.user.studentId).toBe('20210104001');
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'sarah.faculty@aust.edu',
          password: 'WrongPassword123!'
        });

      expect(res.status).toBe(401);
    });

    it('should return profile on GET /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', studentToken);

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('student');
      expect(res.body.user.name).toBe('Alex Rivera');
    });

    it('should logout successfully on POST /api/auth/logout', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', studentToken);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/logged out/i);
    });
  });

  describe('3. Synchronized Faculty & Student Workflow', () => {
    it('Faculty creates Course and Exam', async () => {
      const courseRes = await request(app)
        .post('/api/courses')
        .set('Authorization', facultyToken)
        .send({
          name: 'Data Structures and Algorithms',
          code: 'CSE 2201'
        });

      expect(courseRes.status).toBe(201);
      courseId = courseRes.body.id;

      const examRes = await request(app)
        .post('/api/courses/exams')
        .set('Authorization', facultyToken)
        .send({
          courseId,
          title: 'Midterm Exam Fall 2026'
        });

      expect(examRes.status).toBe(201);
      examId = examRes.body.id;
    });

    it('Faculty posts a Question with Correct Answer benchmark', async () => {
      const questionRes = await request(app)
        .post('/api/questions')
        .set('Authorization', facultyToken)
        .send({
          examId,
          questionNumber: 'Q3',
          text: 'Explain recursion and the importance of a base case.',
          correctAnswer: 'A recursive function calls itself on smaller inputs until reaching a base case condition which stops further recursive calls and returns the base result.',
          maxMarks: 10,
          clos: [
            { code: 'CLO-2', description: 'Design recursive algorithms with base case termination.' }
          ]
        });

      expect(questionRes.status).toBe(201);
      expect(questionRes.body).toHaveProperty('id');
      expect(questionRes.body.question_number).toBe('Q3');
      expect(questionRes.body.correct_answer).toBeDefined();

      questionId = questionRes.body.id;
    });

    it('Student submits their answer for the question', async () => {
      const subRes = await request(app)
        .post('/api/submissions')
        .set('Authorization', studentToken)
        .send({
          questionId,
          answerText: 'Recursion is when a function calls itself. If head == NULL return head, then reverse rest.'
        });

      expect(subRes.status).toBe(201);
      expect(subRes.body.message).toMatch(/submitted successfully/i);
    });

    it('Faculty uploads additional student answer batch and runs AI analysis', async () => {
      // Upload batch answers
      await request(app)
        .post(`/api/questions/${questionId}/upload`)
        .set('Authorization', facultyToken)
        .send({
          rawText: `Node* reverse(Node* head) { if (head == NULL || head->next == NULL) return head; Node* rest = reverse(head->next); head->next->next = head; head->next = NULL; return rest; }
Node* reverse(Node* head) { Node* rest = reverse(head->next); head->next->next = head; head->next = NULL; return rest; }
Node* reverse(Node* head) { if (head == NULL) return head; Node* rest = reverse(head->next); head->next = head; return rest; }`
        });

      // Run Misconception Analysis on Question
      const analysisRes = await request(app)
        .post('/api/analyses')
        .set('Authorization', facultyToken)
        .send({
          questionId
        });

      expect(analysisRes.status).toBe(200);
      expect(analysisRes.body).toHaveProperty('id');
      expect(analysisRes.body).toHaveProperty('groups');
      expect(analysisRes.body.groups.length).toBeGreaterThanOrEqual(2);
      expect(analysisRes.body).toHaveProperty('insight');
      expect(analysisRes.body).toHaveProperty('intervention');
      expect(analysisRes.body.totalSubmissions).toBeGreaterThanOrEqual(4);

      // Verify each group has label, count, and percentage
      analysisRes.body.groups.forEach(g => {
        expect(g).toHaveProperty('label');
        expect(g).toHaveProperty('percentage');
        expect(g).toHaveProperty('count');
      });
    });

    it('Student sees updated personalized lackings and diagnostic feedback in their portal', async () => {
      const feedbackRes = await request(app)
        .get('/api/submissions/my-feedback')
        .set('Authorization', studentToken);

      expect(feedbackRes.status).toBe(200);
      expect(Array.isArray(feedbackRes.body)).toBe(true);
      expect(feedbackRes.body.length).toBeGreaterThanOrEqual(1);

      const studentFeedback = feedbackRes.body[0];
      expect(studentFeedback.questionId).toBe(questionId);
      expect(studentFeedback.analysisStatus).toBe('analyzed');
      expect(studentFeedback.evaluation).toBeDefined();
      expect(studentFeedback.evaluation.identifiedLacking).toBeDefined();
      expect(studentFeedback.evaluation.feedback.length).toBeGreaterThan(5);
      expect(studentFeedback.evaluation.recommendedAction.length).toBeGreaterThan(5);
    });
  });
});
