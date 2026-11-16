import useForm from '../../hooks/useForm';
import { useData } from '../../context/DataContext';

const toDateTimeInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

export default function useCreateFlight(onClose, flight) {
  const { data, create, updateEntity } = useData();

  const routeOptions = data.routes.map((r) => ({ value: r.id, label: `${r.origin} ➔ ${r.destination}` }));
  const aircraftOptions = data.aircrafts.map((a) => ({ value: a.code, label: `${a.code} - ${a.model}` }));

  const { values, bind } = useForm({
    code: flight?.code ?? '', route: flight?.routeId ?? routeOptions[0]?.value,
    departure: toDateTimeInput(flight?.departure), arrival: toDateTimeInput(flight?.arrival),
    aircraft: flight?.aircraft ?? aircraftOptions[0]?.value,
  });

  const submit = async (e) => {
    e.preventDefault();
    if (flight) {
      const ok = await updateEntity('flights', flight.id, values, `Voo ${flight.code} atualizado com sucesso!`);
      if (ok) onClose();
      return;
    }
    const ok = await create('flights', values, `Voo ${values.code.toUpperCase()} criado com sucesso!`);
    if (ok) onClose();
  };

  return { bind, submit, routeOptions, aircraftOptions, editing: Boolean(flight) };
}
