import Modal from '../common/Modal';
import Field from '../common/Field';
import FormActions from '../common/FormActions';
import useAircraftForm from './useAircraftForm';

const STATUS = [
  { value: 'Ativa', label: 'Ativa (Pronta pra Voo)' },
  { value: 'Em Manutenção', label: 'Em Manutenção' },
];

export default function AircraftModal({ onClose }) {
  const { bind, submit } = useAircraftForm(onClose);
  return (
    <Modal title="Cadastrar Aeronave" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Código / Matrícula da Aeronave" required placeholder="Ex: PR-DEC" {...bind('code')} />
        <Field label="Modelo da Aeronave" required placeholder="Ex: Boeing 737-800 ou Airbus A320" {...bind('model')} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fabricante" required placeholder="Ex: Embraer" {...bind('maker')} />
          <Field label="Capacidade (Assentos)" type="number" required placeholder="180" {...bind('capacity')} />
        </div>
        <Field label="Status Operacional" options={STATUS} {...bind('status')} />
        <FormActions onCancel={onClose} submitLabel="Cadastrar Aeronave" />
      </form>
    </Modal>
  );
}
