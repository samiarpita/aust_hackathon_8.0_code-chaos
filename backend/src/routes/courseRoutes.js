const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware, optionalAuth, requireRole } = require('../middleware/auth');
const { validateBody, createCourseSchema, createExamSchema, postAssignmentSchema } = require('../middleware/validate');

// Public & Student Coursework Catalog (accessible with or without login)
router.get('/faculties', optionalAuth, courseController.listFaculties);
router.get('/student-assignments', optionalAuth, courseController.listStudentAssignments);

// Protected course & exam endpoints
router.get('/', authMiddleware, courseController.listCourses);
router.post('/', authMiddleware, requireRole('faculty'), validateBody(createCourseSchema), courseController.createCourse);

// Assignments / Exams
router.get('/exams', authMiddleware, courseController.listExams);
router.post('/exams', authMiddleware, requireRole('faculty'), validateBody(createExamSchema), courseController.createExam);
router.post('/assignments', optionalAuth, validateBody(postAssignmentSchema), courseController.postAssignment);

module.exports = router;
