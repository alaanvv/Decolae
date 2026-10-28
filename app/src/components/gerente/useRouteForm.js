import useForm from '../../hooks/useForm';
import { useData } from '../../context/DataContext';

export default function useRouteForm(onClose) {
  const { create } = useData();
  const { values, bind } = useForm({ origin: '', destination: '' });

  const submit = async (e) => {
    e.preventDefault();
    if (await create('routes', values, 'Novo trajeto cadastrado!')) onClose();
  };

  return { bind, submit };
}
