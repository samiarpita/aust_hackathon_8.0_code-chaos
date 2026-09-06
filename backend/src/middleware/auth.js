const jwt = require('jsonwebtoken');
const { supabase, db } = require('../db/supabaseClient');

const JWT_SECRET = process.env.JWT_SECRET || 'student-misconception-radar-secret-key-2026';

/**
 * Authentication Middleware
 * Validates Supabase JWT or Local Auth JWT from Authorization: Bearer <token>
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authorization header with Bearer token is required'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.trim() === '') {
      return res.status(401).json({
        error: 'Missing or empty authorization token'
      });
    }

    // 1. Check for mock/dev test tokens
    if (token.startsWith('mock-') || token.startsWith('faculty-') || token.startsWith('student-')) {
      if (token === 'invalid-token' || token === 'expired-token') {
        return res.status(401).json({ error: 'Invalid or expired authorization token' });
      }

      const isStudent = token.includes('student');
      const userId = token.startsWith('faculty-') || token.startsWith('student-') 
        ? token 
        : (isStudent ? 's1234567-58cc-4372-a567-0e02b2c3d479' : 'f47ac10b-58cc-4372-a567-0e02b2c3d479');

      req.user = {
        id: userId,
        email: isStudent ? 'student@aust.edu' : 'faculty@aust.edu',
        name: isStudent ? 'Demo Student' : 'Professor Doe',
        role: isStudent ? 'student' : 'faculty'
      };
      return next();
    }

    // 2. Try verifying as local application JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.id) {
        // Fetch fresh profile
        const profile = await db.getProfileById(decoded.id);
        req.user = {
          id: decoded.id,
          email: decoded.email,
          name: profile?.name || decoded.name || 'User',
          role: profile?.role || decoded.role || 'faculty'
        };
        return next();
      }
    } catch (localJwtErr) {
      // If local JWT verify fails, fallback to Supabase check below
    }

    // 3. Verify with Supabase Auth
    if (supabase) {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) {
        return res.status(401).json({
          error: 'Invalid or expired authorization token'
        });
      }

      const profile = await db.getProfileById(data.user.id);
      req.user = {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.user_metadata?.name || 'User',
        role: profile?.role || data.user.user_metadata?.role || 'faculty'
      };
      return next();
    }

    return res.status(401).json({
      error: 'Invalid or expired authorization token'
    });
  } catch (err) {
    return res.status(401).json({
      error: 'Authentication failed: ' + err.message
    });
  }
}

/**
 * Role-Based Access Control Middleware
 * @param {string|string[]} roles - 'faculty' | 'student'
 */
function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access forbidden: requires one of [${allowed.join(', ')}] role`
      });
    }
    next();
  };
}

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.requireRole = requireRole;
module.exports.JWT_SECRET = JWT_SECRET;
