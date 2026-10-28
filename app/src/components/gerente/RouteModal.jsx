import Modal from '../common/Modal';
import Field from '../common/Field';
import FormActions from '../common/FormActions';
import useRouteForm from './useRouteForm';

export default function RouteModal({ onClose }) {
  const { bind, submit } = useRouteForm(onClose);
  return (
    <Modal title="Criar Novo Trajeto / Rota" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Origem (Cidade/Aeroporto)" required placeholder="Ex: São Paulo (GRU)" {...bind('origin')} />
        <Field label="Destino (Cidade/Aeroporto)" required placeholder="Ex: Salvador (SSA)" {...bind('destination')} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Distância (km)" type="number" required placeholder="1450" {...bind('distance')} />
          <Field label="Tempo Estimado" required placeholder="Ex: 2h 15m" {...bind('time')} />
        </div>
        <FormActions onCancel={onClose} submitLabel="Salvar Trajeto" />
      </form>
    </Modal>
  );
}
