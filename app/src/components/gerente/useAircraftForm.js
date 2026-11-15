import useForm from '../../hooks/useForm';
import { useData } from '../../context/DataContext';

export default function useAircraftForm(onClose, aircraft) {
  const { create, updateEntity } = useData();
  const { values, bind } = useForm({
    code: aircraft?.code ?? '',
    model: aircraft?.model ?? '',
    capacity: aircraft?.capacity ?? '',
  });

  const submit = async (e) => {
    e.preventDefault();
    const ok = aircraft
      ? await updateEntity('aircrafts', aircraft.id, values, 'Aeronave atualizada.')
      : await create('aircrafts', values, 'Aeronave adicionada à frota!');
    if (ok) onClose();
  };

  return { bind, submit };
}
