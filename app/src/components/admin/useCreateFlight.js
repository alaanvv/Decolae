import useForm from '../../hooks/useForm';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function useCreateFlight(onClose) {
  const { data, add } = useData();
  const { toast } = useToast();

  const routeOptions = data.routes.map((r) => `${r.origin} ➔ ${r.destination}`);
  const aircraftOptions = data.aircrafts
    .filter((a) => a.status === 'Ativa')
    .map((a) => ({ value: `${a.code} (${a.model})`, label: `${a.code} - ${a.model}` }));

  const { values, bind } = useForm({
    code: '', route: routeOptions[0], departure: '', arrival: '',
    aircraft: aircraftOptions[0]?.value, price: 450, status: 'Programado',
  });

  const submit = (e) => {
    e.preventDefault();
    const [origin, destination] = values.route.split(' ➔ ');
    const flight = {
      id: Date.now(),
      code: values.code.toUpperCase(),
      origin, destination,
      departure: values.departure,
      arrival: values.arrival,
      aircraft: values.aircraft,
      price: parseFloat(values.price),
      status: values.status,
    };
    add('flights', flight);
    onClose();
    toast(`Voo ${flight.code} criado com sucesso!`, 'success');
  };

  return { bind, submit, routeOptions, aircraftOptions };
}
