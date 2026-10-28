import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function useRoutes() {
  const { data, remove } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const removeRoute = (id) => {
    if (!confirm('Remover este trajeto?')) return;
    remove('routes', id);
    toast('Trajeto excluído.', 'info');
  };

  return { routes: data.routes, open, setOpen, removeRoute };
}
