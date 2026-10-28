import useForm from '../../hooks/useForm';
import { useData } from '../../context/DataContext';

export default function useAircraftForm(onClose) {
  const { create } = useData();
  const { values, bind } = useForm({ code: '', model: '', capacity: '' });

  const submit = async (e) => {
    e.preventDefault();
    if (await create('aircrafts', values, 'Aeronave adicionada à frota!')) onClose();
  };

  return { bind, submit };
}
