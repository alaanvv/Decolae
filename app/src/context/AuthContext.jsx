import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/api';

const STORAGE_KEY = 'decolae_user';

const ROLES = {
  ADMINISTRADOR: { type: 'admin', role: 'Administrador' },
  GERENTE: { type: 'gerente', role: 'Gerente Operacional' },
  CLIENTE: { type: 'cliente', role: 'Passageiro / Cliente' },
};

const AuthCtx = createContext(null);

function saveUser(user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      type: user.type,
      role: user.role,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
    }));
  } catch {
    // The server-side session remains valid if local storage is unavailable.
  }
}

function clearSavedUser() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* Ignore unavailable storage. */ }
}

function toAppUser(user) {
  const tipo = String(user.tipo ?? user.tipo_usuario ?? '').toUpperCase();
  const role = ROLES[tipo];
  return role ? { ...role, name: user.nome, email: user.email, cpf: user.cpf_cliente ?? null } : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.session()
      .then((response) => {
        const next = toAppUser(response);
        if (!next) throw new Error('Perfil de usuário inválido.');
        saveUser(next);
        setUser(next);
      })
      .catch(() => {
        clearSavedUser();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, senha) => {
    const u = await authApi.login(email.trim(), senha);
    const next = toAppUser(u);
    if (!next) throw new Error('Perfil de usuário inválido.');
    saveUser(next);
    setUser(next);
    return next;
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    clearSavedUser();
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register: authApi.register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
