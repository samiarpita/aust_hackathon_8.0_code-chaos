const { db } = require('../db/supabaseClient');

class CourseService {
  async createCourse({ facultyId, name, code }) {
    return await db.createCourse({ facultyId, name, code });
  }

  async listCourses(user) {
    if (user.role === 'student') {
      return await db.listCoursesForStudent(user.id);
    }
    return await db.listCoursesForFaculty(user.id);
  }

  async createExam({ courseId, title }) {
    return await db.createExam({ courseId, title });
  }

  async listExams(courseId) {
    return await db.listExamsForCourse(courseId);
  }

  async listFaculties() {
    return await db.listAllFaculties();
  }

  async listStudentAssignments(studentId) {
    return await db.listStudentAssignments(studentId);
  }

  async postAssignment(assignmentData) {
    return await db.postAssignment(assignmentData);
  }
}

module.exports = new CourseService();
