import { useState } from 'react';
import { useData } from '../../context/DataContext';

const EMPTY = { term: '', date: '' };

export default function useClienteFilters() {
  const { data } = useData();
  const [filters, setFilters] = useState(EMPTY);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const reset = () => setFilters(EMPTY);

  const term = filters.term.toLowerCase();
  const flights = data.flights.filter(
    (f) =>
      [f.origin, f.destination, f.code].some((s) => s.toLowerCase().includes(term)) &&
      (!filters.date || f.departure.startsWith(filters.date))
  );

  return { filters, setFilter, reset, flights };
}
