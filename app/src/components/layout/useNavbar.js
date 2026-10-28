import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function useNavbar() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast('Sessão encerrada.', 'info');
  };

  return { user, handleLogout };
}
