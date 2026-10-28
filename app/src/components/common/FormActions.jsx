export default function FormActions({ onCancel, submitLabel }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold rounded-lg">
        Cancelar
      </button>
      <button type="submit" className="px-4 py-2 bg-decolae-600 hover:bg-decolae-500 text-white text-xs font-semibold rounded-lg shadow-md">
        {submitLabel}
      </button>
    </div>
  );
}
