import useForm from '../../hooks/useForm';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function useCrewForm(onClose) {
  const { add } = useData();
  const { toast } = useToast();
  const { values, bind } = useForm({ name: '', role: 'Piloto / Comandante', license: '', status: 'Disponível' });

  const submit = (e) => {
    e.preventDefault();
    add('crew', { id: Date.now(), ...values, license: values.license.toUpperCase() });
    onClose();
    toast('Novo tripulante cadastrado!', 'success');
  };

  return { bind, submit };
}
