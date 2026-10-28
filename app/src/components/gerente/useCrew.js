import { useState } from 'react';
import { useData } from '../../context/DataContext';

export default function useCrew() {
  const { data } = useData();
  const [open, setOpen] = useState(false);
  return { crew: data.crew, open, setOpen };
}
