import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { resources } from '../services/api';

export default function useReservations() {
  const { data, reload } = useData();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const book = async (flight, seat) => {
    setBusy(true);
    try {
      await resources.passages.create(flight.code, seat);
      await reload(['passages', 'flights']);
      toast(`Passagem emitida para o voo ${flight.code}, assento ${seat}.`, 'success');
      return true;
    } catch (error) {
      toast(error.message, 'error');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (ticket) => {
    if (!window.confirm(`Cancelar a passagem ${ticket.id}?`)) return;
    try {
      await resources.passages.cancel(ticket.id);
      await reload(['passages', 'flights']);
      toast('Passagem cancelada.', 'info');
    } catch (error) {
      toast(error.message, 'error');
    }
  };

  return { reservations: data.passages, book, cancel, busy };
}
