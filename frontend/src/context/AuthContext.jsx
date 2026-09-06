import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('learnmap_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('learnmap_token') || null;
  });

  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('learnmap_user_role') || 'faculty';
  });

  const [loading, setLoading] = useState(true);

  // Sync token and user profile on mount
  useEffect(() => {
    async function verifyUser() {
      const storedToken = localStorage.getItem('learnmap_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setActiveRole(data.user.role || 'faculty');
          localStorage.setItem('learnmap_user', JSON.stringify(data.user));
          localStorage.setItem('learnmap_user_role', data.user.role || 'faculty');
        } else {
          // Token expired or invalid
          localStorage.removeItem('learnmap_token');
          localStorage.removeItem('learnmap_user');
          setUser(null);
        }
      } catch (err) {
        console.warn('Could not verify session with backend:', err);
      } finally {
        setLoading(false);
      }
    }

    verifyUser();
  }, []);

  const switchRole = (newRole) => {
    setActiveRole(newRole);
    localStorage.setItem('learnmap_user_role', newRole);
  };

  /**
   * Real Sign In
   */
  const signIn = async ({ email, studentId, idNumber, semester, password, role = 'faculty' }) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        studentId: studentId || idNumber,
        semester,
        password,
        role
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed. Please verify your credentials.');
    }

    setToken(data.token);
    setUser(data.user);
    setActiveRole(data.user.role);

    localStorage.setItem('learnmap_token', data.token);
    localStorage.setItem('learnmap_user', JSON.stringify(data.user));
    localStorage.setItem('learnmap_user_role', data.user.role);

    return data;
  };

  /**
   * Real Sign Up / Registration
   */
  const signUp = async ({ name, email, studentId, idNumber, semester, department, password, role = 'faculty' }) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        studentId: studentId || idNumber,
        semester,
        department,
        password,
        role
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed. Please check constraints.');
    }

    setToken(data.token);
    setUser(data.user);
    setActiveRole(data.user.role);

    localStorage.setItem('learnmap_token', data.token);
    localStorage.setItem('learnmap_user', JSON.stringify(data.user));
    localStorage.setItem('learnmap_user_role', data.user.role);

    return data;
  };

  /**
   * Sign Out - Clears user state and storage
   */
  const signOut = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }
    } catch {}

    setUser(null);
    setToken(null);
    localStorage.removeItem('learnmap_token');
    localStorage.removeItem('learnmap_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        role: user?.role || activeRole,
        activeRole: user?.role || activeRole,
        switchRole,
        signIn,
        signUp,
        signOut,
        isFaculty: (user?.role || activeRole) === 'faculty',
        isStudent: (user?.role || activeRole) === 'student',
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
