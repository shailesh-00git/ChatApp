export default function Sidebar({ rooms, activeRoom, onSelectRoom }) {
  return (
    <aside className="w-64 bg-white rounded-2xl p-3 flex flex-col gap-2 shadow-sm">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 pt-1 pb-1">
        Rooms
      </p>
      {rooms.length === 0 ? (
        <p className="text-slate-400 text-sm text-center mt-6 px-3">
          No rooms yet. Create one!
        </p>
      ) : (
        rooms.map((r) => (
          <div
            key={r.id}
            onClick={() => onSelectRoom(r)}
            className={`flex items-center gap-2 rounded-xl p-3 cursor-pointer transition-colors ${
              activeRoom?.id === r.id
                ? "bg-[#AAF0D1] text-slate-800 font-medium"
                : "text-slate-500 hover:bg-gray-50"
            }`}
          >
            <span className="font-bold text-[#52ad8c]">#</span>
            <span className="truncate">{r.name}</span>
          </div>
        ))
      )}
    </aside>
  );
}