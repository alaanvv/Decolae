import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function useLogin() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');

  const fillProfile = (type) => setEmail(`${type}@decolae.com`);

  const submit = (e) => {
    e.preventDefault();
    const user = login(email);
    toast(`Bem-vindo(a) ao Decolae, ${user.name}!`, 'success');
  };

  return { email, setEmail, password, setPassword, fillProfile, submit };
}
