import React from "react";

const ChatSection = () => {
  return (
    <main className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Message Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-white">
          <div className="text-slate-400 text-center mt-10">
            Start a conversation...
          </div>
        </div>

        {/* Input Area (Keybar) */}
        <div className="p-4 bg-gray-100 flex items-center gap-3">
          <button className="bg-white text-slate-400 w-10 h-10 flex items-center justify-center rounded-full shadow-sm hover:text-slate-600">
            +
          </button>
          <input
            type="text"
            className="flex-1 px-4 py-2 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AAF0D1] border-none shadow-sm"
            placeholder="Write a message..."
          />
          <button className="bg-[#AAF0D1] text-slate-800 font-bold px-6 py-2 rounded-xl hover:bg-[#8ee4bc] shadow-sm transition-all">
            Send
          </button>
        </div>
      </div>
    </main>
  );
};

export default ChatSection;
