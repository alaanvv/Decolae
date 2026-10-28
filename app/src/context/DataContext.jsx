import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { resources } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const KEY = 'decolae_reservations';
const COLLECTIONS = Object.keys(resources);
const DataCtx = createContext(null);

const loadReservations = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};

export function DataProvider({ children }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState({ routes: [], aircrafts: [], crew: [], flights: [], reservations: loadReservations() });
  const [loading, setLoading] = useState(false);

  const reload = useCallback(
    async (cols = COLLECTIONS) => {
      const results = await Promise.allSettled(cols.map((c) => resources[c].list()));
      setData((d) => {
        const next = { ...d };
        results.forEach((r, i) => { if (r.status === 'fulfilled') next[cols[i]] = r.value; });
        return next;
      });
      const failed = results.find((r) => r.status === 'rejected');
      if (failed) toast(failed.reason.message, 'error');
    },
    [toast]
  );

  // Carrega tudo da API assim que o usuário entra.
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, [user, reload]);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data.reservations));
  }, [data.reservations]);

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

  const addReservation = (r) => setData((d) => ({ ...d, reservations: [...d.reservations, r] }));
  const removeReservation = (id) => setData((d) => ({ ...d, reservations: d.reservations.filter((r) => r.id !== id) }));

  return (
    <DataCtx.Provider value={{ data, loading, reload, create, addReservation, removeReservation }}>
      {children}
    </DataCtx.Provider>
  );
}

export const useData = () => useContext(DataCtx);
