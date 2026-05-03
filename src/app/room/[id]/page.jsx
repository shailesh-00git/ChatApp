"use client";
import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RoomPage({ params }) {
  const router = useRouter();
  const { id: roomId } = React.use(params);

  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [text, setText] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showNamePrompt, setShowNamePrompt] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("chat_username");
    }
    return true;
  });
  const [tempUsername, setTempUsername] = useState("");

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const channelRef = useRef(null);

  const username =
    typeof window !== "undefined" ? localStorage.getItem("chat_username") : "";

  // ================= SAVE USERNAME =================
  const saveUsername = (e) => {
    e.preventDefault();
    if (!tempUsername.trim()) return;
    localStorage.setItem("chat_username", tempUsername);
    setShowNamePrompt(false);
  };

  // ================= LOAD DATA =================
  useEffect(() => {
    if (!roomId) return;

    const load = async () => {
      const [{ data: roomData }, { data: msgs }] = await Promise.all([
        supabase.from("rooms").select("*").eq("id", roomId).single(),
        supabase
          .from("messages")
          .select("*")
          .eq("room_id", roomId)
          .order("created_at", { ascending: true }),
      ]);

      setRoom(roomData);
      setMessages(msgs || []);
      setMembers([...new Set((msgs || []).map((m) => m.username))]);
    };

    load();
  }, [roomId]);

  // ================= REALTIME (messages + typing) =================
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room-${roomId}`, {
        config: { presence: { key: username } },
      })
      // Message inserts
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        ({ new: newMsg }) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setMembers((prev) =>
            prev.includes(newMsg.username) ? prev : [...prev, newMsg.username],
          );
        },
      )
      // Typing broadcast
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const { user, isTyping } = payload;
        if (user === username) return;

        setTypingUsers((prev) => {
          if (isTyping && !prev.includes(user)) return [...prev, user];
          if (!isTyping) return prev.filter((u) => u !== user);
          return prev;
        });
      })
      .subscribe();

    channelRef.current = channel;

    return () => supabase.removeChannel(channel);
  }, [roomId, username]);

  // ================= AUTO SCROLL =================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // ================= TYPING HANDLER =================
  const handleTyping = (e) => {
    setText(e.target.value);

    // Broadcast typing: true
    channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { user: username, isTyping: true },
    });

    // Clear previous timeout
    clearTimeout(typingTimeoutRef.current);

    // After 2s of inactivity, broadcast typing: false
    typingTimeoutRef.current = setTimeout(() => {
      channelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: { user: username, isTyping: false },
      });
    }, 2000);
  };

  // ================= SEND =================
  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Stop typing indicator immediately on send
    clearTimeout(typingTimeoutRef.current);
    channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { user: username, isTyping: false },
    });

    const messageText = text;
    setText("");

    const tempMessage = {
      id: `temp-${Date.now()}`,
      room_id: roomId,
      username,
      content: messageText,
      pending: true,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    const { data } = await supabase
      .from("messages")
      .insert({ room_id: roomId, username, content: messageText })
      .select()
      .single();

    if (data) {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMessage.id ? data : m)),
      );
    }
  };

  // ================= COPY CODE =================
  const copyRoomCode = () => {
    if (room?.room_code) {
      navigator.clipboard.writeText(room.room_code);
      toast.success("Room code copied!");
    }
  };

  // ================= LEAVE =================
  const leaveChat = () => {
    localStorage.removeItem("chat_username");
    router.push("/");
  };

  // ================= TYPING LABEL =================
  const typingLabel = () => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing`;
    if (typingUsers.length === 2)
      return `${typingUsers[0]} and ${typingUsers[1]} are typing`;
    return "Several people are typing";
  };

  return (
    <main className="h-dvh flex bg-[#f8fafc] text-slate-800 font-sans p-2 sm:p-3 md:p-4 gap-3 md:gap-4 overflow-hidden">
      {/* SIDEBAR — desktop only */}
      <div className="hidden lg:flex flex-col w-72 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-lg text-slate-800">Members</h2>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
            Active Now
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {members.map((member) => (
            <div
              key={member}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#7ce7b7] flex items-center justify-center text-xs font-bold text-slate-700">
                {member?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{member}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT SECTION */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-w-0">
        {/* HEADER */}
        <header className="px-3 sm:px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="lg:hidden w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z"
                />
              </svg>
            </button>
            <h1 className="font-bold text-base sm:text-lg md:text-xl flex items-center gap-1.5 truncate">
              <span className="text-[#4ade80] shrink-0">#</span>
              <span className="truncate">{room?.name || "Loading..."}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={copyRoomCode}
              className="font-mono font-bold tracking-[3px] sm:tracking-[4px] text-[#2d7a5d] text-sm sm:text-base bg-[#7ce7b7]/10 hover:bg-[#7ce7b7]/20 px-2 sm:px-3 py-1.5 rounded-xl transition-all active:scale-95"
              title="Tap to copy"
            >
              {room?.room_code}
            </button>
            <button
              onClick={leaveChat}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-100 transition-all active:scale-95"
            >
              Leave
            </button>
          </div>
        </header>

        {/* MOBILE MEMBERS DRAWER */}
        {showMembers && (
          <div className="lg:hidden border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Members ({members.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => (
                <div
                  key={member}
                  className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-full px-3 py-1 shadow-sm"
                >
                  <div className="w-4 h-4 rounded-full bg-[#7ce7b7] flex items-center justify-center text-[9px] font-bold text-slate-700">
                    {member?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    {member}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 bg-slate-50/30">
          {messages.map((m) => {
            const isOwn = m.username === username;
            return (
              <div
                key={m.id}
                className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[88%] sm:max-w-[80%] md:max-w-[70%]">
                  {!isOwn && (
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 ml-2 mb-1 block">
                      {m.username}
                    </span>
                  )}
                  <div
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-sm transition-all ${
                      isOwn
                        ? "bg-[#7ce7b7] text-slate-800 rounded-tr-none"
                        : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                    } ${m.pending ? "animate-pulse opacity-70" : ""}`}
                  >
                    <p className="text-sm leading-relaxed break-words">
                      {m.content}
                    </p>
                    <div
                      className={`text-[9px] mt-1 opacity-50 flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── TYPING INDICATOR ── */}
          {typingUsers.length > 0 && (
            <div className="flex items-end gap-2">
              {/* Bubble */}
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                {/* Three animated dots */}
                <span
                  className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: "0ms", animationDuration: "1s" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: "200ms", animationDuration: "1s" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: "400ms", animationDuration: "1s" }}
                />
              </div>
              {/* Label */}
              <span className="text-[10px] text-slate-400 font-medium mb-1 italic">
                {typingLabel()}
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT BOX */}
        <footer className="p-2 sm:p-3 md:p-4 bg-white border-t border-slate-100">
          <form
            onSubmit={send}
            className="flex items-center gap-2 bg-slate-50 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-[#7ce7b7]/30 transition-all"
          >
            <input
              className="flex-1 bg-transparent px-3 sm:px-4 py-2 outline-none text-sm placeholder:text-slate-400"
              value={text}
              onChange={handleTyping}
              placeholder={`Message #${room?.name || "room"}...`}
            />
            <button
              disabled={!text.trim()}
              className="bg-[#7ce7b7] hover:bg-[#66d1a1] text-slate-800 px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-30 active:scale-95 shrink-0"
            >
              Send
            </button>
          </form>
        </footer>
      </div>

      {/* USERNAME MODAL */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Almost there!
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mb-5 sm:mb-6">
              You&apos;re entering{" "}
              <span className="font-bold text-slate-800">{room?.name}</span>.
              What should we call you?
            </p>
            <form onSubmit={saveUsername} className="space-y-3 sm:space-y-4">
              <input
                autoFocus
                className="w-full border border-slate-200 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none focus:ring-2 focus:ring-[#7ce7b7] transition-all bg-slate-50 text-sm sm:text-base"
                placeholder="Enter your name..."
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
              />
              <button className="w-full bg-[#7ce7b7] text-slate-800 font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:bg-[#66d1a1] transition-all shadow-lg shadow-[#7ce7b7]/20 text-sm sm:text-base">
                Enter Room
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
