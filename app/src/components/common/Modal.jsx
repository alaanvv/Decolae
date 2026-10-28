export default function Modal({ title, onClose, size = 'max-w-md', children }) {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-slate-800 border border-slate-700 w-full ${size} rounded-2xl shadow-2xl p-6 relative`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <i className="fa-solid fa-xmark text-lg" />
        </button>
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}
