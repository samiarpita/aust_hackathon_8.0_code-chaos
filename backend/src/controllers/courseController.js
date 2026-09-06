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
}

module.exports = new CourseController();
