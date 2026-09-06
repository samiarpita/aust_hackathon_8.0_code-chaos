const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, name, role, studentId, idNumber, semester, department } = req.validatedBody || req.body;
      const result = await authService.register({
        email,
        password,
        name,
        role,
        studentId: studentId || idNumber,
        semester,
        department
      });
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, studentId, idNumber, semester, password, role } = req.validatedBody || req.body;
      const result = await authService.login({
        email,
        studentId: studentId || idNumber,
        semester,
        password,
        role
      });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async me(req, res, next) {
    try {
      return res.status(200).json({ user: req.user });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res) {
    return res.status(200).json({ message: 'Logged out successfully' });
  }
}

module.exports = new AuthController();
