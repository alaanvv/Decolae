import Modal from '../common/Modal';
import Field from '../common/Field';
import FormActions from '../common/FormActions';
import useCrewForm from './useCrewForm';

const ROLES = ['Piloto / Comandante', 'Co-Piloto', 'Comissário(a) de Bordo', 'Chefe de Cabine'];
const STATUS = ['Disponível', 'Em Escala / Voo', 'Folga / Licença'];

export default function CrewModal({ onClose }) {
  const { bind, submit } = useCrewForm(onClose);
  return (
    <Modal title="Cadastrar Tripulante" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nome Completo" required placeholder="Ex: Capitão Carlos Silva" {...bind('name')} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cargo / Função" options={ROLES} {...bind('role')} />
          <Field label="Licença ANAC / Registro" required placeholder="Ex: ANAC-8849" {...bind('license')} />
        </div>
        <Field label="Status da Escala" options={STATUS} {...bind('status')} />
        <FormActions onCancel={onClose} submitLabel="Salvar Tripulante" />
      </form>
    </Modal>
  );
}
