import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function useCrew() {
  const { data, remove } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const removeCrew = (id) => {
    if (!confirm('Remover este integrante da equipe?')) return;
    remove('crew', id);
    toast('Tripulante removido.', 'info');
  };

  return { crew: data.crew, open, setOpen, removeCrew };
}
