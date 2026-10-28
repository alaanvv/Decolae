import Modal from '../common/Modal';
import Field from '../common/Field';
import FormActions from '../common/FormActions';
import useCreateFlight from './useCreateFlight';

const STATUS = ['Programado', 'Confirmado', 'Em Voo'];

export default function CreateFlightModal({ onClose }) {
  const { bind, submit, routeOptions, aircraftOptions } = useCreateFlight(onClose);
  return (
    <Modal title="Cadastrar Novo Voo" onClose={onClose} size="max-w-lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Código do Voo" required placeholder="Ex: DEC-1020" {...bind('code')} />
          <Field label="Trajeto (Rota)" required options={routeOptions} {...bind('route')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data / Hora Partida" type="datetime-local" required {...bind('departure')} />
          <Field label="Data / Hora Chegada" type="datetime-local" required {...bind('arrival')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Aeronave Atribuída" required options={aircraftOptions} {...bind('aircraft')} />
          <Field label="Preço da Passagem (R$)" type="number" min="50" step="10" required {...bind('price')} />
        </div>
        <Field label="Status Inicial" options={STATUS} {...bind('status')} />
        <FormActions onCancel={onClose} submitLabel="Salvar Voo" />
      </form>
    </Modal>
  );
}
