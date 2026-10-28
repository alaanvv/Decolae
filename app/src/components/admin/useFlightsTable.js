import { useState } from 'react';
import { useData } from '../../context/DataContext';

export default function useFlightsTable() {
  const { data } = useData();
  const [search, setSearch] = useState('');

  const term = search.toLowerCase();
  const flights = data.flights.filter((f) =>
    [f.code, f.origin, f.destination].some((s) => String(s ?? '').toLowerCase().includes(term))
  );

  return { flights, search, setSearch };
}
