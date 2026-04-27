export default function ChatContainer({ 
  activeRoom, messages, username, messageText, setMessageText, onSend, bottomRef 
}) {
  return (
    <main className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-slate-800"># {activeRoom.name}</h2>
            <p className="text-xs text-slate-400">created by {activeRoom.created_by}</p>
          </div>
          <span className="text-sm bg-[#AAF0D1] text-slate-700 font-medium px-3 py-1 rounded-full">
            {username}
          </span>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-white flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="text-slate-400 text-center mt-10">No messages yet. Say hello! 👋</div>
          ) : (
            messages.map((msg) => (
              <MessageItem key={msg.id} msg={msg} isOwn={msg.username === username} />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={onSend} className="p-4 bg-gray-100 flex items-center gap-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 px-4 py-2 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AAF0D1] border-none shadow-sm"
            placeholder="Write a message..."
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="bg-[#AAF0D1] text-slate-800 font-bold px-6 py-2 rounded-xl hover:bg-[#8ee4bc] shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}

function MessageItem({ msg, isOwn }) {
  return (
    <div className={`flex flex-col gap-1 max-w-sm ${isOwn ? "self-end items-end" : "self-start items-start"}`}>
      {!isOwn && <span className="text-xs text-[#52ad8c] font-semibold px-1">{msg.username}</span>}
      <div className={`px-4 py-2 rounded-2xl text-sm ${isOwn ? "bg-[#AAF0D1] text-slate-800 rounded-br-sm" : "bg-gray-100 text-slate-700 rounded-bl-sm"}`}>
        {msg.content}
      </div>
      <span className="text-[10px] text-slate-400 px-1">
        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}