import useForm from '../../hooks/useForm';
import { useData } from '../../context/DataContext';

export default function useCrewForm(onClose) {
  const { create } = useData();
  const { values, bind } = useForm({ name: '', cpf: '' });

  const submit = async (e) => {
    e.preventDefault();
    if (await create('crew', values, 'Novo tripulante cadastrado!')) onClose();
  };

  return { bind, submit };
}
