import { createContext, useContext, useState } from 'react';

const PROFILES = {
  admin: { name: 'Carlos Administrador', role: 'Administrador' },
  gerente: { name: 'Mariana Gerente', role: 'Gerente Operacional' },
  cliente: { name: 'Gabriel Cliente', role: 'Passageiro / Cliente' },
};

const detectType = (email) =>
  email.includes('admin') ? 'admin' : email.includes('gerente') ? 'gerente' : 'cliente';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (rawEmail) => {
    const email = rawEmail.toLowerCase().trim();
    const type = detectType(email);
    const next = { ...PROFILES[type], email, type };
    setUser(next);
    return next;
  };

  return <AuthCtx.Provider value={{ user, login, logout: () => setUser(null) }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
