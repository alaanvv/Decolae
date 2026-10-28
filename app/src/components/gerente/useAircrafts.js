import { useState } from 'react';
import { useData } from '../../context/DataContext';

export default function useAircrafts() {
  const { data } = useData();
  const [open, setOpen] = useState(false);
  return { aircrafts: data.aircrafts, open, setOpen };
}
