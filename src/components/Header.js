export default function Header({ onReset, onInvite, activeRoom, showInvite }) {
  return (
    <header className="bg-white shadow-sm rounded-2xl flex justify-between items-center py-4 px-8">
      <h1 className="text-3xl font-bold text-slate-800">
        Chat<span className="text-[#52ad8c]">Off</span>
      </h1>
      <nav className="flex justify-center items-center gap-3">
        <button
          onClick={onReset}
          className="bg-[#AAF0D1] text-slate-800 font-semibold px-6 py-2 rounded-xl hover:bg-[#8ee4bc] transition-all shadow-sm"
        >
          + Create Room
        </button>
        <button
          onClick={onInvite}
          disabled={!activeRoom}
          className="border-2 border-[#AAF0D1] text-slate-700 font-semibold px-6 py-2 rounded-xl hover:bg-[#AAF0D1] transition-all disabled:opacity-40 disabled:cursor-not-allowed relative"
        >
          🔗 Invite
          {showInvite && (
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
              Link copied!
            </span>
          )}
        </button>
      </nav>
    </header>
  );
}