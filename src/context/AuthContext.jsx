import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const USERS_DB = {
  admin: { role: 'superadmin', name: 'SuperAdmin Principal', pass: '1234' },
  ventrox: { role: 'superadmin', name: 'VentroX Master', pass: '1234' },
  superadmin: { role: 'superadmin', name: 'SuperAdmin Root', pass: '1234' },
  finanzas: { role: 'finanzas', name: 'Operador de Finanzas', pass: '1234' },
  cobranzas: { role: 'finanzas', name: 'Gestor de Cobranzas', pass: '1234' },
  soporte: { role: 'soporte', name: 'Técnico de Soporte', pass: '1234' },
  tecnico: { role: 'soporte', name: 'Especialista POS', pass: '1234' }
};

const STORAGE_KEY = 'vx_superadmin_auth';
const USER_KEY = 'vx_superadmin_user';
const ROLE_KEY = 'vx_superadmin_role';
const NAME_KEY = 'vx_superadmin_name';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return sessionStorage.getItem(USER_KEY) || null;
    } catch {
      return null;
    }
  });

  const [userRole, setUserRole] = useState(() => {
    try {
      return sessionStorage.getItem(ROLE_KEY) || 'superadmin';
    } catch {
      return 'superadmin';
    }
  });

  const [userName, setUserName] = useState(() => {
    try {
      return sessionStorage.getItem(NAME_KEY) || 'Administrador';
    } catch {
      return 'Administrador';
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

    const matchedAccount = USERS_DB[cleanUser];

    if (matchedAccount && cleanPass === matchedAccount.pass) {
      setIsAuthenticated(true);
      setUser(cleanUser);
      setUserRole(matchedAccount.role);
      setUserName(matchedAccount.name);

      try {
        sessionStorage.setItem(STORAGE_KEY, 'true');
        sessionStorage.setItem(USER_KEY, cleanUser);
        sessionStorage.setItem(ROLE_KEY, matchedAccount.role);
        sessionStorage.setItem(NAME_KEY, matchedAccount.name);
        sessionStorage.setItem('vx_current_view', 'admin');
      } catch (e) {
        console.warn('SessionStorage unavailable', e);
      }
      return { success: true, role: matchedAccount.role };
    }

    return { 
      success: false, 
      error: 'Credenciales inválidas. Usuarios disponibles: admin, finanzas, soporte (Contraseña: 1234)' 
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setUserRole('superadmin');
    setUserName('Administrador');
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(ROLE_KEY);
      sessionStorage.removeItem(NAME_KEY);
      sessionStorage.setItem('vx_current_view', 'landing');
    } catch (e) {
      console.warn('SessionStorage unavailable', e);
    }
  };

  // Helper de permisos por rol
  const hasPermission = (permission) => {
    if (userRole === 'superadmin') return true;

    if (userRole === 'finanzas') {
      const allowed = [
        'view_businesses', 
        'record_payments', 
        'view_payments', 
        'view_calendar', 
        'export_reports', 
        'distributor_commissions',
        'approve_payments',
        'generate_receipts'
      ];
      return allowed.includes(permission);
    }

    if (userRole === 'soporte') {
      const allowed = [
        'view_businesses', 
        'manage_devices', 
        'manage_modules', 
        'view_telemetry', 
        'manage_tickets', 
        'whatsapp',
        'global_control'
      ];
      return allowed.includes(permission);
    }

    return false;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, userRole, userName, login, logout, hasPermission }}>
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

