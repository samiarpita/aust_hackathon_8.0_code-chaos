import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext();

export const DEMO_FACULTY_USER = {
  id: 'faculty-001',
  email: 'faculty@aust.edu',
  role: 'faculty',
  user_metadata: {
    full_name: 'Dr. Arpita Sengupta',
    role: 'faculty',
    department: 'Department of Computer Science & Engineering',
    course: 'CSE 2100: Data Structures'
  }
};

export const DEMO_STUDENT_USER = {
  id: 'student-042',
  email: 'alex.chen@student.aust.edu',
  role: 'student',
  user_metadata: {
    full_name: 'Alex Chen',
    role: 'student',
    student_id: '2026-CSE-042',
    enrolled_courses: ['CSE 2100: Data Structures']
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedRole = localStorage.getItem('learnmap_user_role') || 'faculty';
      return savedRole === 'student' ? DEMO_STUDENT_USER : DEMO_FACULTY_USER;
    } catch {
      return DEMO_FACULTY_USER;
    }
  });

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('learnmap_user_role') || 'faculty';
  });

  useEffect(() => {
    try {
      localStorage.setItem('learnmap_user_role', activeRole);
    } catch (e) {
      console.warn(e);
    }
  }, [activeRole]);

  // Switch role explicitly
  const switchRole = (newRole) => {
    setActiveRole(newRole);
    if (newRole === 'student') {
      setUser(DEMO_STUDENT_USER);
    } else {
      setUser(DEMO_FACULTY_USER);
    }
  };

  const loginAsDemoFaculty = () => {
    setActiveRole('faculty');
    setUser(DEMO_FACULTY_USER);
  };

  const loginAsDemoStudent = () => {
    setActiveRole('student');
    setUser(DEMO_STUDENT_USER);
  };

  const signIn = async (email, password, role = 'faculty') => {
    if (!isSupabaseConfigured()) {
      if (role === 'student') {
        loginAsDemoStudent();
      } else {
        loginAsDemoFaculty();
      }
      return { data: { user }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      setUser({ ...data.user, role });
      setActiveRole(role);
    }
    return { data, error };
  };

  const signUp = async (email, password, metadata = {}, role = 'faculty') => {
    if (!isSupabaseConfigured()) {
      if (role === 'student') {
        loginAsDemoStudent();
      } else {
        loginAsDemoFaculty();
      }
      return { data: { user }, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { ...metadata, role } }
    });
    return { data, error };
  };

  const signOut = () => {
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: activeRole,
        activeRole,
        switchRole,
        loginAsDemoFaculty,
        loginAsDemoStudent,
        signIn,
        signUp,
        signOut,
        isFaculty: activeRole === 'faculty',
        isStudent: activeRole === 'student',
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
