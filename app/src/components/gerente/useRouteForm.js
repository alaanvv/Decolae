import useForm from '../../hooks/useForm';
import { useData } from '../../context/DataContext';

export default function useRouteForm(onClose, route) {
  const { create, updateEntity } = useData();
  const { values, bind } = useForm({ origin: route?.origin ?? '', destination: route?.destination ?? '' });

  const submit = async (e) => {
    e.preventDefault();
    const ok = route
      ? await updateEntity('routes', route.id, values, 'Trajeto atualizado.')
      : await create('routes', values, 'Novo trajeto cadastrado!');
    if (ok) onClose();
  };

  return { bind, submit };
}
