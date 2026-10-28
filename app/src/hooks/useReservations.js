import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatDate';

export default function useReservations() {
  const { data, add, remove } = useData();
  const { toast } = useToast();

  const book = (flight) => {
    const row = Math.floor(Math.random() * 25) + 1;
    const seat = `${row}${'ABCDEF'[Math.floor(Math.random() * 6)]}`;
    add('reservations', {
      id: Date.now(),
      flightCode: flight.code,
      origin: flight.origin,
      destination: flight.destination,
      departure: formatDate(flight.departure),
      seat,
      price: flight.price,
    });
    toast(`Assento ${seat} reservado com sucesso para o voo ${flight.code}!`, 'success');
  };

  const cancel = (id) => {
    if (!confirm('Deseja realmente cancelar esta reserva?')) return;
    remove('reservations', id);
    toast('Reserva cancelada.', 'info');
  };

  return { reservations: data.reservations, book, cancel };
}
