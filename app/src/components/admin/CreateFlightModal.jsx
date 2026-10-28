import Modal from '../common/Modal';
import Field from '../common/Field';
import FormActions from '../common/FormActions';
import { STATUS_OPTIONS } from '../../utils/flightStatus';
import useCreateFlight from './useCreateFlight';

export default function CreateFlightModal({ onClose }) {
  const { bind, submit, routeOptions, aircraftOptions } = useCreateFlight(onClose);
  return (
    <Modal title="Cadastrar Novo Voo" onClose={onClose} size="max-w-lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Número do Voo" required placeholder="Ex: DL1001" {...bind('code')} />
          <Field label="Trajeto (Rota)" required options={routeOptions} {...bind('route')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Previsão de Partida" type="datetime-local" required {...bind('departure')} />
          <Field label="Previsão de Chegada" type="datetime-local" required {...bind('arrival')} />
        </div>
        <Field label="Aeronave Atribuída" required options={aircraftOptions} {...bind('aircraft')} />
        <Field label="Status Inicial" options={STATUS_OPTIONS} {...bind('status')} />
        <FormActions onCancel={onClose} submitLabel="Salvar Voo" />
      </form>
    </Modal>
  );
}
