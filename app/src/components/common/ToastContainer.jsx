const STYLES = {
  info: ['border-slate-600 text-slate-200', 'fa-circle-info text-blue-400'],
  success: ['border-emerald-500/50 text-white', 'fa-circle-check text-emerald-400'],
  error: ['border-rose-500/50 text-white', 'fa-triangle-exclamation text-rose-400'],
};

export default function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3">
      {toasts.map(({ id, message, type }) => {
        const [box, icon] = STYLES[type] || STYLES.info;
        return (
          <div key={id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-slate-800 shadow-2xl text-xs font-medium ${box}`}>
            <i className={`fa-solid ${icon} text-base`} />
            <span>{message}</span>
          </div>
        );
      })}
    </div>
  );
}
