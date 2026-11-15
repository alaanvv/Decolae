import { useState } from 'react';
import { useData } from '../../context/DataContext';

const EMPTY = { origin: '', destination: '', date: '' };
const localDate = (iso) => new Date(iso).toLocaleDateString('sv-SE'); // YYYY-MM-DD no fuso local

export default function useClienteFilters() {
  const { data } = useData();
  const [filters, setFilters] = useState(EMPTY);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const reset = () => setFilters(EMPTY);

  const origin = filters.origin.trim().toLowerCase();
  const destination = filters.destination.trim().toLowerCase();
  const flights = data.flights.filter(
    (f) =>
      f.canBook && f.availableSeats > 0 &&
      String(f.origin ?? '').toLowerCase().includes(origin) &&
      String(f.destination ?? '').toLowerCase().includes(destination) &&
      (!filters.date || localDate(f.departure) >= filters.date)
  );

  return { filters, setFilter, reset, flights };
}
