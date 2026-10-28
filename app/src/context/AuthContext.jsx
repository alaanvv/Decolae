import { createContext, useContext, useState } from 'react';
import { authApi } from '../services/api';

const ROLES = {
  ADMINISTRADOR: { type: 'admin', role: 'Administrador' },
  GERENTE: { type: 'gerente', role: 'Gerente Operacional' },
  CLIENTE: { type: 'cliente', role: 'Passageiro / Cliente' },
};

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (email, senha) => {
    const u = await authApi.login(email.trim(), senha);
    const tipo = String(u.tipo ?? u.tipo_usuario ?? 'CLIENTE').toUpperCase();
    const next = { ...(ROLES[tipo] || ROLES.CLIENTE), name: u.nome, email: u.email ?? email };
    setUser(next);
    return next;
  };

  return (
    <AuthCtx.Provider value={{ user, login, register: authApi.register, logout: () => setUser(null) }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
