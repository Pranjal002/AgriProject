import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS, INITIAL_OFFICES } from '../services/mockData';
import { addAuditLog } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('namr_current_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default to Super Admin for comprehensive initial view
    return INITIAL_USERS[0];
  });

  const [currentOffice, setCurrentOffice] = useState(() => {
    return INITIAL_OFFICES.find(o => o.id === currentUser?.office_id) || INITIAL_OFFICES[0];
  });

  useEffect(() => {
    if (currentUser) {
      const off = INITIAL_OFFICES.find(o => o.id === currentUser.office_id) || INITIAL_OFFICES[0];
      setCurrentOffice(off);
      localStorage.setItem('namr_current_user', JSON.stringify(currentUser));
    } else {
      setCurrentOffice(null);
      localStorage.removeItem('namr_current_user');
    }
  }, [currentUser]);

  const switchDemoUser = (userId) => {
    const user = INITIAL_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      addAuditLog({
        user_id: user.id,
        user_name: user.full_name,
        action: 'LOGIN',
        table_name: 'profiles',
        record_id: user.id,
        new_values: { email: user.email, role: user.role }
      });
    }
  };

  const login = async (email, password) => {
    // Check in demo users list
    const found = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      await addAuditLog({
        user_id: found.id,
        user_name: found.full_name,
        action: 'LOGIN',
        table_name: 'profiles',
        record_id: found.id,
        new_values: { email: found.email, role: found.role }
      });
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials. Use demo switcher or valid account.' };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentOffice(null);
    localStorage.removeItem('namr_current_user');
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isOfficeAdmin = currentUser?.role === 'office_admin';
  const isDataEntry = currentUser?.role === 'data_entry';
  const isViewer = currentUser?.role === 'viewer';
  const canEdit = isSuperAdmin || isOfficeAdmin || isDataEntry;

  const governmentLevel = currentOffice?.government_level || 1; // 1: Federal, 2: Provincial, 3: Local

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentOffice,
        switchDemoUser,
        login,
        logout,
        isSuperAdmin,
        isOfficeAdmin,
        isDataEntry,
        isViewer,
        canEdit,
        governmentLevel,
        availableDemoUsers: INITIAL_USERS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

