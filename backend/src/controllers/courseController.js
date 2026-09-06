const courseService = require('../services/courseService');

class CourseController {
  async createCourse(req, res, next) {
    try {
      const { name, code } = req.validatedBody || req.body;
      const course = await courseService.createCourse({
        facultyId: req.user.id,
        name,
        code
      });
      return res.status(201).json(course);
    } catch (err) {
      next(err);
    }
  }

  async listCourses(req, res, next) {
    try {
      const courses = await courseService.listCourses(req.user);
      return res.status(200).json(courses);
    } catch (err) {
      next(err);
    }
  }

  async createExam(req, res, next) {
    try {
      const { courseId, title } = req.validatedBody || req.body;
      const exam = await courseService.createExam({ courseId, title });
      return res.status(201).json(exam);
    } catch (err) {
      next(err);
    }
  }

  async listExams(req, res, next) {
    try {
      const { courseId } = req.query;
      if (!courseId) {
        return res.status(400).json({ error: 'courseId query parameter is required' });
      }
      const exams = await courseService.listExams(courseId);
      return res.status(200).json(exams);
    } catch (err) {
      next(err);
    }
  }

  async listFaculties(req, res, next) {
    try {
      const faculties = await courseService.listFaculties();
      return res.status(200).json(faculties);
    } catch (err) {
      next(err);
    }
  }

  async listStudentAssignments(req, res, next) {
    try {
      const studentId = req.user?.role === 'student' ? req.user.id : null;
      const assignments = await courseService.listStudentAssignments(studentId);
      return res.status(200).json(assignments);
    } catch (err) {
      next(err);
    }
  }

  async postAssignment(req, res, next) {
    try {
      const data = req.validatedBody || req.body;
      const result = await courseService.postAssignment({
        ...data,
        facultyId: req.user?.id || data.facultyId,
        facultyName: req.user?.name || data.facultyName,
        facultyEmail: req.user?.email || data.facultyEmail
      });
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CourseController();
