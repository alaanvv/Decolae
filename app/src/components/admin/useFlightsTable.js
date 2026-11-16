import { useState } from 'react';
import { useData } from '../../context/DataContext';

export default function useFlightsTable() {
  const { data, deleteEntity } = useData();
  const [search, setSearch] = useState('');

  const term = search.toLowerCase();
  const flights = data.flights.filter((f) =>
    [f.code, f.origin, f.destination].some((s) => String(s ?? '').toLowerCase().includes(term))
  );

  const remove = async (flight) => {
    if (!window.confirm(`Remover o voo ${flight.code}? Voos com passagens ou tripulantes vinculados não podem ser removidos.`)) return;
    await deleteEntity('flights', flight.id, `Voo ${flight.code} removido.`);
  };

  return { flights, search, setSearch, remove };
}
