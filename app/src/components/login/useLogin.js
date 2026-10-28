import { useState } from 'react';
import useForm from '../../hooks/useForm';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function useLogin() {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const { values, bind, setValues } = useForm({ nome: '', cpf: '', telefone: '', email: '', senha: '123456' });

  const fillProfile = (type) => setValues((v) => ({ ...v, email: `${type}@decolae.com` }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(values);
        toast('Cadastro realizado! Faça login para continuar.', 'success');
        setMode('login');
      } else {
        const user = await login(values.email, values.senha);
        toast(`Bem-vindo(a) ao Decolae, ${user.name}!`, 'success');
      }
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return { mode, setMode, loading, bind, fillProfile, submit };
}
