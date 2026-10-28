import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatDate';

// A API ainda não tem rotas de reserva: elas ficam salvas localmente (localStorage).
export default function useReservations() {
  const { data, addReservation, removeReservation } = useData();
  const { toast } = useToast();

  const book = (flight) => {
    const row = Math.floor(Math.random() * 25) + 1;
    const seat = `${row}${'ABCDEF'[Math.floor(Math.random() * 6)]}`;
    addReservation({
      id: Date.now(),
      flightCode: flight.code,
      origin: flight.origin,
      destination: flight.destination,
      departure: formatDate(flight.departure),
      seat,
    });
    toast(`Assento ${seat} reservado com sucesso para o voo ${flight.code}!`, 'success');
  };

  const cancel = (id) => {
    if (!confirm('Deseja realmente cancelar esta reserva?')) return;
    removeReservation(id);
    toast('Reserva cancelada.', 'info');
  };

  return { reservations: data.reservations, book, cancel };
}
