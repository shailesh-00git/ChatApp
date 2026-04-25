"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [roomName, setRoomName] = useState("");
  const [joinRoomName, setJoinRoomName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [showJoin, setShowJoin] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  // ─── Restore username from localStorage ───
  useEffect(() => {
    const saved = localStorage.getItem("chat_username");
    if (saved) setUsername(saved);
  }, []);

  // ─── Fetch all rooms + realtime new rooms ───
  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await supabase
        .from("rooms")
        .select("*")
        .order("created_at", { ascending: true });
      if (data) setRooms(data);
    };

    fetchRooms();

    const channel = supabase
      .channel("rooms-list")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "rooms" },
        (payload) => setRooms((prev) => [...prev, payload.new]),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ─── Fetch messages when room changes ───
  useEffect(() => {
    if (!activeRoom) return;

    setMessages([]);

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", activeRoom.id)
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) setMessages(data);
    };

    fetchMessages();

    // Realtime messages for this room only
    const channel = supabase
      .channel(`messages-${activeRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${activeRoom.id}`,
        },
        (payload) => setMessages((prev) => [...prev, payload.new]),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [activeRoom]);

  // ─── Auto scroll to latest message ───
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Create Room ───
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) return setError("Enter your username.");
    if (!roomName.trim()) return setError("Enter a room name.");

    setLoading(true);

    // Check duplicate
    const { data: existing } = await supabase
      .from("rooms")
      .select("id")
      .eq("name", roomName.trim())
      .single();

    if (existing) {
      setLoading(false);
      return setError("Room name already taken.");
    }

    const { data: room, error: err } = await supabase
      .from("rooms")
      .insert({ name: roomName.trim(), created_by: username.trim() })
      .select()
      .single();

    setLoading(false);

    if (err) return setError("Failed to create room.");

    localStorage.setItem("chat_username", username.trim());
    setRoomName("");
    setActiveRoom(room);
  };

  // ─── Join Room ───
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) return setError("Enter your username.");
    if (!joinRoomName.trim()) return setError("Enter a room name to join.");

    const { data: room } = await supabase
      .from("rooms")
      .select("*")
      .eq("name", joinRoomName.trim())
      .single();

    if (!room) return setError("Room not found.");

    localStorage.setItem("chat_username", username.trim());
    setJoinRoomName("");
    setShowJoin(false);
    setActiveRoom(room);
  };

  // ─── Send Message ───
  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeRoom || !username) return;

    await supabase.from("messages").insert({
      room_id: activeRoom.id,
      username: username.trim(),
      content: messageText.trim(),
    });

    setMessageText("");
  };

  // ─── Copy invite link ───
  const handleInvite = () => {
    if (!activeRoom) return;
    const link = `${window.location.origin}?join=${activeRoom.name}`;
    navigator.clipboard.writeText(link);
    setShowInvite(true);
    setTimeout(() => setShowInvite(false), 2500);
  };

  return (
    <main className="h-screen w-7xl mx-auto p-4 bg-[#f0eded] flex flex-col gap-4">
      {/* ── HEADER ── */}
      <header className="bg-white shadow-sm rounded-2xl flex justify-between items-center py-4 px-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Chat<span className="text-[#52ad8c]">Off</span>
        </h1>
        <nav className="flex justify-center items-center gap-3">
          <button
            onClick={() => {
              setActiveRoom(null);
              setShowJoin(false);
              setError(null);
            }}
            className="bg-[#AAF0D1] text-slate-800 font-semibold px-6 py-2 rounded-xl hover:bg-[#8ee4bc] transition-all shadow-sm"
          >
            + Create Room
          </button>
          <button
            onClick={handleInvite}
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

      <div className="flex flex-row gap-4 flex-1 overflow-hidden pb-4">
        {/* ── SIDEBAR ── */}
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
                onClick={() => {
                  setActiveRoom(r);
                  setError(null);
                }}
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

        {/* ── MAIN AREA ── */}
        {activeRoom ? (
          // ── CHAT VIEW ──
          <main className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Room header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
                <div>
                  <h2 className="font-bold text-slate-800">
                    # {activeRoom.name}
                  </h2>
                  <p className="text-xs text-slate-400">
                    created by {activeRoom.created_by}
                  </p>
                </div>
                <span className="text-sm bg-[#AAF0D1] text-slate-700 font-medium px-3 py-1 rounded-full">
                  {username}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto bg-white flex flex-col gap-3">
                {messages.length === 0 ? (
                  <div className="text-slate-400 text-center mt-10">
                    No messages yet. Say hello! 👋
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.username === username;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col gap-1 max-w-sm ${isOwn ? "self-end items-end" : "self-start items-start"}`}
                      >
                        {!isOwn && (
                          <span className="text-xs text-[#52ad8c] font-semibold px-1">
                            {msg.username}
                          </span>
                        )}
                        <div
                          className={`px-4 py-2 rounded-2xl text-sm ${
                            isOwn
                              ? "bg-[#AAF0D1] text-slate-800 rounded-br-sm"
                              : "bg-gray-100 text-slate-700 rounded-bl-sm"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-400 px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Message input */}
              <form
                onSubmit={handleSend}
                className="p-4 bg-gray-100 flex items-center gap-3"
              >
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
        ) : (
          // ── CREATE / JOIN VIEW ──
          <main className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden grid place-content-center">
            <div className="flex flex-col justify-center items-center space-y-5">
              <h1 className="text-4xl font-bold text-slate-800">
                {showJoin ? (
                  <>
                    Join<span className="text-[#52ad8c]">Room</span>
                  </>
                ) : (
                  <>
                    Create<span className="text-[#52ad8c]">Room</span>
                  </>
                )}
              </h1>

              {/* Error */}
              {error && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-200 px-4 py-2 rounded-xl w-80 text-center">
                  {error}
                </p>
              )}

              {!showJoin ? (
                // ── CREATE FORM ──
                <form
                  onSubmit={handleCreateRoom}
                  className="flex flex-col w-80 border ring-2 p-8 ring-[#AAF0D1] space-y-5 rounded-xl border-[#9ef3cd]"
                >
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AAF0D1] border border-gray-200 shadow-sm"
                    placeholder="Room Name..."
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AAF0D1] border border-gray-200 shadow-sm"
                    placeholder="Username..."
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#AAF0D1] text-slate-800 font-semibold px-6 py-2 rounded-xl hover:bg-[#8ee4bc] transition-all shadow-sm disabled:opacity-50"
                  >
                    {loading ? "Creating…" : "Create Room"}
                  </button>
                </form>
              ) : (
                // ── JOIN FORM ──
                <form
                  onSubmit={handleJoinRoom}
                  className="flex flex-col w-80 border ring-2 p-8 ring-[#AAF0D1] space-y-5 rounded-xl border-[#9ef3cd]"
                >
                  <input
                    type="text"
                    value={joinRoomName}
                    onChange={(e) => setJoinRoomName(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AAF0D1] border border-gray-200 shadow-sm"
                    placeholder="Room Name..."
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AAF0D1] border border-gray-200 shadow-sm"
                    placeholder="Username..."
                  />
                  <button
                    type="submit"
                    className="bg-[#AAF0D1] text-slate-800 font-semibold px-6 py-2 rounded-xl hover:bg-[#8ee4bc] transition-all shadow-sm"
                  >
                    Join Room
                  </button>
                </form>
              )}

              {/* Toggle between Create / Join */}
              <button
                onClick={() => {
                  setShowJoin(!showJoin);
                  setError(null);
                }}
                className="bg-[#AAF0D1] w-80 text-xl text-slate-800 font-semibold px-6 py-2 rounded-xl hover:bg-[#8ee4bc] transition-all shadow-sm"
              >
                {showJoin ? "← Back to Create" : "Join Room"}
              </button>
            </div>
          </main>
        )}
      </div>
    </main>
  );
}
