import { useState } from 'react';
import { useData } from '../../context/DataContext';

export default function useRoutes() {
  const { data, deleteEntity } = useData();
  const [open, setOpen] = useState(false);
  const remove = (route) => {
    if (window.confirm(`Excluir o trajeto ${route.origin} → ${route.destination}?`))
      return deleteEntity('routes', route.id, 'Trajeto excluído.');
  };
  return { routes: data.routes, open, setOpen, remove };
}
