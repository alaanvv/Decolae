import { useState } from 'react';
import { useData } from '../../context/DataContext';

export default function useRoutes() {
  const { data } = useData();
  const [open, setOpen] = useState(false);
  return { routes: data.routes, open, setOpen };
}
