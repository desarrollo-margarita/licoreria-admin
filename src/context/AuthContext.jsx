import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const VALID_USERNAMES = ['admin', 'ventrox', 'superadmin'];
const SUPERADMIN_PASSWORD = '1234';
const STORAGE_KEY = 'vx_superadmin_auth';
const USER_KEY = 'vx_superadmin_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return sessionStorage.getItem(USER_KEY) || null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const login = (usernameInput, passwordInput) => {
    const cleanUser = (usernameInput || '').trim().toLowerCase();
    const cleanPass = (passwordInput || '').trim();

    if (!cleanUser) {
      return { success: false, error: 'Por favor ingresa tu usuario de administrador.' };
    }

    if (!cleanPass) {
      return { success: false, error: 'Por favor ingresa tu contraseña.' };
    }

    if (VALID_USERNAMES.includes(cleanUser) && cleanPass === SUPERADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setUser(cleanUser);
      try {
        sessionStorage.setItem(STORAGE_KEY, 'true');
        sessionStorage.setItem(USER_KEY, cleanUser);
        sessionStorage.setItem('vx_current_view', 'admin');
      } catch (e) {
        console.warn('SessionStorage unavailable', e);
      }
      return { success: true };
    }

    return { 
      success: false, 
      error: 'Credenciales inválidas. Usuario: admin · Contraseña: 1234' 
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(USER_KEY);
      sessionStorage.setItem('vx_current_view', 'landing');
    } catch (e) {
      console.warn('SessionStorage unavailable', e);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
