import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { initialData } from '../data/initialData';

const STORAGE_KEY = 'decolae_data';
const DataCtx = createContext(null);

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialData;
  } catch (e) {
    console.error('Erro ao carregar cache local', e);
    return initialData;
  }
}

export function DataProvider({ children }) {
  const [data, setData] = useState(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const add = useCallback((col, item) => setData((d) => ({ ...d, [col]: [...d[col], item] })), []);
  const remove = useCallback((col, id) => setData((d) => ({ ...d, [col]: d[col].filter((i) => i.id !== id) })), []);
  const update = useCallback(
    (col, id, patch) => setData((d) => ({ ...d, [col]: d[col].map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
    []
  );

  return <DataCtx.Provider value={{ data, add, remove, update }}>{children}</DataCtx.Provider>;
}

export const useData = () => useContext(DataCtx);
