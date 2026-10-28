import useForm from '../../hooks/useForm';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function useAircraftForm(onClose) {
  const { add } = useData();
  const { toast } = useToast();
  const { values, bind } = useForm({ code: '', model: '', maker: '', capacity: '', status: 'Ativa' });

  const submit = (e) => {
    e.preventDefault();
    add('aircrafts', { id: Date.now(), ...values, code: values.code.toUpperCase(), capacity: parseInt(values.capacity) });
    onClose();
    toast('Aeronave adicionada à frota!', 'success');
  };

  return { bind, submit };
}
