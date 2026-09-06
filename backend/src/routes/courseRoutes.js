const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { validateBody, createCourseSchema, createExamSchema } = require('../middleware/validate');

// All course endpoints require authentication
router.use(authMiddleware);

// Courses
router.get('/', courseController.listCourses);
router.get('/faculties', courseController.listFaculties);
router.get('/student-assignments', courseController.listStudentAssignments);
router.post('/', requireRole('faculty'), validateBody(createCourseSchema), courseController.createCourse);

// Exams
router.get('/exams', courseController.listExams);
router.post('/exams', requireRole('faculty'), validateBody(createExamSchema), courseController.createExam);

module.exports = router;
