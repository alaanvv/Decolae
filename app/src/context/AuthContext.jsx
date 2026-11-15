import { createContext, useContext, useState } from 'react';
import { authApi } from '../services/api';

const STORAGE_KEY = 'decolae_user';

const ROLES = {
  ADMINISTRADOR: { type: 'admin', role: 'Administrador' },
  GERENTE: { type: 'gerente', role: 'Gerente Operacional' },
  CLIENTE: { type: 'cliente', role: 'Passageiro / Cliente' },
};

const AuthCtx = createContext(null);

function loadSavedUser() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && ['admin', 'gerente', 'cliente'].includes(saved.type) && saved.email && saved.name)
      return { type: saved.type, role: saved.role, name: saved.name, email: saved.email };
  } catch {
    // Remove corrupted or inaccessible saved session data and show the login screen.
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSavedUser);

  const login = async (email, senha) => {
    const u = await authApi.login(email.trim(), senha);
    const tipo = String(u.tipo ?? u.tipo_usuario ?? 'CLIENTE').toUpperCase();
    const next = { ...(ROLES[tipo] || ROLES.CLIENTE), name: u.nome, email: u.email ?? email };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Login still works if browser storage is disabled or full.
    }
    setUser(next);
    return next;
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // The in-memory session is still cleared.
    }
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, login, register: authApi.register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
