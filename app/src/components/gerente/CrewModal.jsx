import Modal from '../common/Modal';
import Field from '../common/Field';
import FormActions from '../common/FormActions';
import useCrewForm from './useCrewForm';

export default function CrewModal({ onClose }) {
  const { bind, submit } = useCrewForm(onClose);
  return (
    <Modal title="Cadastrar Tripulante" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nome Completo" required placeholder="Ex: João da Silva" {...bind('name')} />
        <Field label="CPF" required placeholder="12345678901" {...bind('cpf')} />
        <FormActions onCancel={onClose} submitLabel="Salvar Tripulante" />
      </form>
    </Modal>
  );
}
