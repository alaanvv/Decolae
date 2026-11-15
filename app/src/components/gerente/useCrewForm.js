import useForm from '../../hooks/useForm';
import { useData } from '../../context/DataContext';

export default function useCrewForm(onClose, member) {
  const { create, updateEntity } = useData();
  const { values, bind } = useForm({ name: member?.name ?? '', cpf: member?.cpf ?? '' });

  const submit = async (e) => {
    e.preventDefault();
    const ok = member
      ? await updateEntity('crew', member.id, values, 'Tripulante atualizado.')
      : await create('crew', values, 'Novo tripulante cadastrado!');
    if (ok) onClose();
  };

  return { bind, submit };
}
