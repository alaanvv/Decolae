import Modal from '../common/Modal';
import Field from '../common/Field';
import FormActions from '../common/FormActions';
import useAircraftForm from './useAircraftForm';

export default function AircraftModal({ onClose, aircraft }) {
  const { bind, submit } = useAircraftForm(onClose, aircraft);
  return (
    <Modal title={aircraft ? 'Editar Aeronave' : 'Cadastrar Aeronave'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Identificação da Aeronave" required placeholder="Ex: PT-ABC" {...bind('code')} />
        <Field label="Modelo da Aeronave" required placeholder="Ex: Boeing 737" {...bind('model')} />
        <Field label="Quantidade de Assentos" type="number" min="1" required placeholder="180" {...bind('capacity')} />
        <FormActions onCancel={onClose} submitLabel={aircraft ? 'Salvar Alterações' : 'Cadastrar Aeronave'} />
      </form>
    </Modal>
  );
}
