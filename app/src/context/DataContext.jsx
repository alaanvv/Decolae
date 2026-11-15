import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { resources } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const COLLECTIONS = {
  cliente: ['flights', 'passages'],
  gerente: ['routes', 'aircrafts', 'crew', 'flights'],
  admin: ['routes', 'aircrafts', 'flights'],
};
const DataCtx = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState({ routes: [], aircrafts: [], crew: [], flights: [], passages: [] });
  const [loading, setLoading] = useState(false);

  const reload = useCallback(
    async (cols) => {
      const selected = cols ?? COLLECTIONS[user?.type] ?? [];
      const results = await Promise.allSettled(selected.map((c) => resources[c].list()));
      setData((d) => {
        const next = { ...d };
        results.forEach((r, i) => { if (r.status === 'fulfilled') next[selected[i]] = r.value; });
        return next;
      });
      const failed = results.find((r) => r.status === 'rejected');
      if (failed) toast(failed.reason.message, 'error');
    },
    [toast, user?.type]
  );

  // Carrega tudo da API assim que o usuário entra.
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, [user, reload]);

  // Cria na API, recarrega a coleção e avisa. Retorna true/false.
  const create = async (col, values, successMsg) => {
    try {
      await resources[col].create(values);
      await reload([col]);
      toast(successMsg, 'success');
      return true;
    } catch (e) {
      toast(e.message, 'error');
      return false;
    }
  };

  const deleteEntity = async (col, id, successMsg) => {
    try {
      await resources[col].remove(id);
      await reload([col]);
      toast(successMsg, 'success');
      return true;
    } catch (e) {
      toast(e.message, 'error');
      return false;
    }
  };

  const updateEntity = async (col, id, values, successMsg) => {
    try {
      await resources[col].update(id, values);
      await reload([col]);
      toast(successMsg, 'success');
      return true;
    } catch (e) {
      toast(e.message, 'error');
      return false;
    }
  };

  return (
    <DataCtx.Provider value={{ data, loading, reload, create, updateEntity, deleteEntity }}>
      {children}
    </DataCtx.Provider>
  );
}

export const useData = () => useContext(DataCtx);
