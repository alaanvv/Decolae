import useForm from '../../hooks/useForm';
import { useData } from '../../context/DataContext';

export default function useCreateFlight(onClose) {
  const { data, create } = useData();

  const routeOptions = data.routes.map((r) => ({ value: r.id, label: `${r.origin} ➔ ${r.destination}` }));
  const aircraftOptions = data.aircrafts.map((a) => ({ value: a.code, label: `${a.code} - ${a.model}` }));

  const { values, bind } = useForm({
    code: '', route: routeOptions[0]?.value, departure: '', arrival: '',
    aircraft: aircraftOptions[0]?.value, status: 'PROGRAMADO',
  });

  const submit = async (e) => {
    e.preventDefault();
    const ok = await create('flights', values, `Voo ${values.code.toUpperCase()} criado com sucesso!`);
    if (ok) onClose();
  };

  return { bind, submit, routeOptions, aircraftOptions };
}
