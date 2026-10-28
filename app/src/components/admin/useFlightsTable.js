import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function useFlightsTable() {
  const { data, remove } = useData();
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  const term = search.toLowerCase();
  const flights = data.flights.filter((f) =>
    [f.code, f.origin, f.destination].some((s) => s.toLowerCase().includes(term))
  );

  const removeFlight = (id) => {
    if (!confirm('Deseja realmente remover este voo do sistema?')) return;
    remove('flights', id);
    toast('Voo removido.', 'info');
  };

  return { flights, search, setSearch, removeFlight };
}
