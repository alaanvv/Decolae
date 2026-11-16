import { useEffect } from 'react';

// Em telas pequenas abre como "bottom sheet" ocupando a largura toda e rolando por dentro.
export default function Modal({ title, onClose, size = 'max-w-md', children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div role="dialog" aria-modal="true" aria-label={title}
        className={`bg-slate-800 border border-slate-700 w-full ${size} rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 pb-safe relative max-h-[90dvh] overflow-y-auto custom-scrollbar`}>
        <button onClick={onClose} aria-label="Fechar" className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50">
          <i className="fa-solid fa-xmark text-lg" />
        </button>
        <h3 className="text-xl font-bold text-white mb-4 pr-10">{title}</h3>
        {children}
      </div>
    </div>
  );
}
