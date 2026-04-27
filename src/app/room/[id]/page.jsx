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
  const [showNamePrompt, setShowNamePrompt] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chat_username");
      return !stored;
    }
    return true;
  });
  const [tempUsername, setTempUsername] = useState("");

  const bottomRef = useRef(null);

  const username =
    typeof window !== "undefined" ? localStorage.getItem("chat_username") : "";

  // ================= SAVE USERNAME =================
  const saveUsername = (e) => {
    e.preventDefault();
    if (!tempUsername.trim()) return;

    localStorage.setItem("chat_username", tempUsername);
    window.location.reload();
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

      const uniqueMembers = [...new Set((msgs || []).map((m) => m.username))];
      setMembers(uniqueMembers);
    };

    load();
  }, [roomId]);

  // ================= REALTIME =================
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room-${roomId}`)
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
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [roomId]);

  // ================= AUTO SCROLL =================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ================= SEND =================
  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

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
      .insert({
        room_id: roomId,
        username,
        content: messageText,
      })
      .select()
      .single();

    if (data) {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMessage.id ? data : m)),
      );
    }
  };

  // ================= COPY LINK =================
  const copyRoomLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    toast.success("link copied");
  };

  // ================= LEAVE CHAT =================
  const leaveChat = async () => {
    await supabase
      .from("messages")
      .delete()
      .eq("room_id", roomId)
      .eq("username", username);

    localStorage.removeItem("chat_username");
    router.push("/");
  };

  return (
    <main className="h-screen flex bg-[#f8fafc] text-slate-800 font-sans p-4 gap-4 overflow-hidden">
      {/* SIDEBAR */}
      <div className="hidden md:flex flex-col w-72 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                {member.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{member}</span>
              {member === username && (
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 italic">
                  Me
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CHAT SECTION */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* HEADER */}
        <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md">
          <div className="flex flex-col">
            <h1 className="font-bold text-xl flex items-center gap-2">
              <span className="text-[#4ade80]">#</span>{" "}
              {room?.name || "Loading..."}
            </h1>
            <p className="text-xs text-slate-400">
              Created by {room?.created_by}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyRoomLink}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-slate-100 active:scale-95"
            >
              Invite
            </button>
            <button
              onClick={leaveChat}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-100 transition-all active:scale-95"
            >
              Leave
            </button>
          </div>
        </header>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
          {messages.map((m) => {
            const isOwn = m.username === username;

            return (
              <div
                key={m.id}
                className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[70%] group`}>
                  {!isOwn && (
                    <span className="text-[11px] font-bold text-slate-500 ml-2 mb-1 block">
                      {m.username}
                    </span>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl shadow-sm relative transition-all ${
                      isOwn
                        ? "bg-[#7ce7b7] text-slate-800 rounded-tr-none"
                        : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                    } ${m.pending ? "animate-pulse grayscale" : ""}`}
                  >
                    <p className="text-sm leading-relaxed">{m.content}</p>
                    <div
                      className={`text-[9px] mt-1 opacity-60 flex ${isOwn ? "justify-end" : "justify-start"}`}
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
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <footer className="p-4 bg-white border-t border-slate-100">
          <form
            onSubmit={send}
            className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-[#7ce7b7]/30 transition-all"
          >
            <input
              className="flex-1 bg-transparent px-4 py-2 outline-none text-sm placeholder:text-slate-400"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Message #${room?.name || "room"}...`}
            />
            <button
              disabled={!text.trim()}
              className="bg-[#7ce7b7] hover:bg-[#66d1a1] text-slate-800 px-6 py-2 rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-30 active:scale-95"
            >
              Send
            </button>
          </form>
        </footer>
      </div>

      {/* USERNAME MODAL (Name Prompt) */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold mb-2">Welcome to the Room</h2>
            <p className="text-slate-500 mb-6">
              Choose a username to join the conversation.
            </p>
            <form onSubmit={saveUsername} className="space-y-4">
              <input
                autoFocus
                className="w-full border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#7ce7b7] transition-all bg-slate-50"
                placeholder="Your name..."
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
              />
              <button className="w-full bg-[#7ce7b7] text-slate-800 font-bold py-4 rounded-2xl hover:bg-[#66d1a1] transition-all shadow-lg shadow-[#7ce7b7]/20">
                Start Chatting
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
