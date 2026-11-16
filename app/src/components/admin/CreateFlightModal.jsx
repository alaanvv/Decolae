import Modal from '../common/Modal';
import Field from '../common/Field';
import FormActions from '../common/FormActions';
import useCreateFlight from './useCreateFlight';

export default function CreateFlightModal({ onClose, flight }) {
  const { bind, submit, routeOptions, aircraftOptions, editing } = useCreateFlight(onClose, flight);
  return (
    <Modal title={editing ? `Editar Voo ${flight.code}` : 'Cadastrar Novo Voo'} onClose={onClose} size="max-w-lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {editing
            ? <Field label="Número do Voo" required readOnly {...bind('code')} />
            : <Field label="Número do Voo" required placeholder="Ex: DL1001" {...bind('code')} />}
          <Field label="Trajeto (Rota)" required options={routeOptions} {...bind('route')} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Previsão de Partida" type="datetime-local" required {...bind('departure')} />
          <Field label="Previsão de Chegada" type="datetime-local" required {...bind('arrival')} />
        </div>
        <Field label="Aeronave Atribuída" required options={aircraftOptions} {...bind('aircraft')} />
        <FormActions onCancel={onClose} submitLabel={editing ? 'Salvar Alterações' : 'Salvar Voo'} />
      </form>
    </Modal>
  );
}
