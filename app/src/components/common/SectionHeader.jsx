export default function SectionHeader({ title, buttonLabel, onClick }) {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <button onClick={onClick} className="px-4 py-2 bg-decolae-600 hover:bg-decolae-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-md">
        <i className="fa-solid fa-plus" /> {buttonLabel}
      </button>
    </div>
  );
}
