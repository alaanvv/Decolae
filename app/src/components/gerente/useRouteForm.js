import useForm from '../../hooks/useForm';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function useRouteForm(onClose) {
  const { add } = useData();
  const { toast } = useToast();
  const { values, bind } = useForm({ origin: '', destination: '', distance: '', time: '' });

  const submit = (e) => {
    e.preventDefault();
    add('routes', { id: Date.now(), ...values, distance: parseInt(values.distance) });
    onClose();
    toast('Novo trajeto cadastrado!', 'success');
  };

  return { bind, submit };
}
