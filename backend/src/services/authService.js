const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const { supabase, db } = require('../db/supabaseClient');
const { JWT_SECRET } = require('../middleware/auth');

class AuthService {
  /**
   * Register a new Faculty or Student user
   */
  async register({ email, password, name, role = 'faculty', studentId = null, idNumber = null, semester = null, department = null }) {
    const cleanEmail = email.toLowerCase().trim();
    const cleanStudentId = studentId || idNumber || null;

    // Check if user profile already exists
    const existingEmail = await db.getProfileByEmail(cleanEmail);
    if (existingEmail) {
      const err = new Error('An account with this email already exists. Please sign in instead.');
      err.statusCode = 400;
      throw err;
    }

    if (cleanStudentId) {
      const existingSid = await db.getProfileByStudentId(cleanStudentId);
      if (existingSid) {
        const err = new Error('An account with this Student ID Number already exists. Please sign in instead.');
        err.statusCode = 400;
        throw err;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = randomUUID();

    let createdUserId = userId;

    // Register with Supabase Auth if configured
    if (supabase) {
      const { data: supaUser, error: supaErr } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: { name, role, studentId: cleanStudentId, semester, department }
      });

      if (!supaErr && supaUser?.user) {
        createdUserId = supaUser.user.id;
      }
    }

    // Save profile record
    const profile = await db.createProfile({
      id: createdUserId,
      email: cleanEmail,
      name,
      role,
      studentId: cleanStudentId,
      semester,
      department
    });

    // Save local hash for fallback verification
    await db.saveUserPassword({
      id: createdUserId,
      email: cleanEmail,
      passwordHash
    });

    // Issue JWT token
    const token = jwt.sign(
      {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        studentId: profile.student_id_number,
        semester: profile.semester
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        studentId: profile.student_id_number,
        semester: profile.semester,
        department: profile.department
      }
    };
  }

  /**
   * Login user with email/studentId, semester, and password
   */
  async login({ email = null, studentId = null, idNumber = null, semester = null, password, role = null }) {
    const inputIdentifier = (studentId || idNumber || email || '').trim();

    let userProfile = null;

    if (inputIdentifier.includes('@')) {
      userProfile = await db.getProfileByEmail(inputIdentifier.toLowerCase());
    } else {
      userProfile = await db.getProfileByStudentId(inputIdentifier);
      if (!userProfile) {
        userProfile = await db.getProfileByEmail(inputIdentifier.toLowerCase());
      }
    }

    if (!userProfile) {
      const err = new Error("No account found with this email or Student ID. Please click 'Create Account' below to register first.");
      err.statusCode = 401;
      throw err;
    }

    // Check role match
    if (role && userProfile.role !== role) {
      const err = new Error(`This account is registered as a ${userProfile.role}. Please switch to the ${userProfile.role === 'faculty' ? 'Faculty' : 'Student'} tab to log in.`);
      err.statusCode = 403;
      throw err;
    }

    // If Supabase is active, try Supabase sign in with the email
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userProfile.email,
        password: password
      });

      if (!error && data.user) {
        const token = jwt.sign(
          {
            id: userProfile.id,
            email: userProfile.email,
            name: userProfile.name,
            role: userProfile.role,
            studentId: userProfile.student_id_number,
            semester: userProfile.semester
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return {
          token,
          user: {
            id: userProfile.id,
            email: userProfile.email,
            name: userProfile.name,
            role: userProfile.role,
            studentId: userProfile.student_id_number,
            semester: userProfile.semester,
            department: userProfile.department
          }
        };
      }
    }

    // Fallback password check via stored bcrypt hash
    const authRecord = await db.getUserAuthByEmail(userProfile.email);
    if (!authRecord) {
      const err = new Error('Invalid email, student ID, or password');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, authRecord.passwordHash);
    if (!isMatch) {
      const err = new Error('Incorrect password. Please verify and try again.');
      err.statusCode = 401;
      throw err;
    }

    const token = jwt.sign(
      {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        studentId: userProfile.student_id_number,
        semester: userProfile.semester
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        studentId: userProfile.student_id_number,
        semester: userProfile.semester,
        department: userProfile.department
      }
    };
  }
}

module.exports = new AuthService();
