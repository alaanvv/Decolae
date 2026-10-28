import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { isBookable } from '../../utils/flightStatus';

const EMPTY = { term: '', date: '' };
const localDate = (iso) => new Date(iso).toLocaleDateString('sv-SE'); // YYYY-MM-DD no fuso local

export default function useClienteFilters() {
  const { data } = useData();
  const [filters, setFilters] = useState(EMPTY);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const reset = () => setFilters(EMPTY);

  const term = filters.term.toLowerCase();
  const flights = data.flights.filter(
    (f) =>
      isBookable(f.status) &&
      [f.origin, f.destination, f.code].some((s) => String(s ?? '').toLowerCase().includes(term)) &&
      (!filters.date || localDate(f.departure) >= filters.date)
  );

  return { filters, setFilter, reset, flights };
}
