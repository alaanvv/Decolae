import Modal from '../common/Modal';
import Field from '../common/Field';
import FormActions from '../common/FormActions';
import useAircraftForm from './useAircraftForm';

export default function AircraftModal({ onClose }) {
  const { bind, submit } = useAircraftForm(onClose);
  return (
    <Modal title="Cadastrar Aeronave" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Identificação da Aeronave" required placeholder="Ex: PT1234" {...bind('code')} />
        <Field label="Modelo da Aeronave" required placeholder="Ex: Boeing 737" {...bind('model')} />
        <Field label="Quantidade de Assentos" type="number" min="1" required placeholder="180" {...bind('capacity')} />
        <FormActions onCancel={onClose} submitLabel="Cadastrar Aeronave" />
      </form>
    </Modal>
  );
}
