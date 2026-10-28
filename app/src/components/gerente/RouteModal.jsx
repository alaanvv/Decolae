import Modal from '../common/Modal';
import Field from '../common/Field';
import FormActions from '../common/FormActions';
import useRouteForm from './useRouteForm';

export default function RouteModal({ onClose }) {
  const { bind, submit } = useRouteForm(onClose);
  return (
    <Modal title="Criar Novo Trajeto / Rota" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Cidade de Origem" required placeholder="Ex: São Paulo" {...bind('origin')} />
        <Field label="Cidade de Destino" required placeholder="Ex: Rio de Janeiro" {...bind('destination')} />
        <FormActions onCancel={onClose} submitLabel="Salvar Trajeto" />
      </form>
    </Modal>
  );
}
