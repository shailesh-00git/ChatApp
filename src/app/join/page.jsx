"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function JoinPage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("rooms").select("*");
      if (!error) setRooms(data);
      setLoading(false);
    };
    fetchRooms();
  }, []);

  const joinRoom = () => {
    if (!username.trim()) return alert("Please enter a username");

    localStorage.setItem("chat_username", username);
    router.push(`/room/${selectedRoom.id}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4 md:p-8">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-to-b from-[#7ce7b7]/10 to-transparent blur-3xl -z-10" />

      <div className="w-full max-w-5xl bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 transition-all">
        {!selectedRoom ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                  Available Rooms
                </h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">
                  Select a space to start chatting
                </p>
              </div>
              <Link href={"/"}>
                <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold py-2 px-4 rounded-xl hover:bg-slate-50 transition-all">
                  &larr; Back Home
                </button>
              </Link>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-[#7ce7b7] rounded-full animate-spin" />
                <div className="text-slate-400 font-medium animate-pulse">
                  Loading rooms...
                </div>
              </div>
            ) : rooms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rooms.map((room, index) => {
                  const colors = [
                    "from-amber-50 to-amber-100/50 text-amber-700 border-amber-200",
                    "from-sky-50 to-sky-100/50 text-sky-700 border-sky-200",
                    "from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200",
                    "from-rose-50 to-rose-100/50 text-rose-700 border-rose-200",
                    "from-violet-50 to-violet-100/50 text-violet-700 border-violet-200",
                  ];

                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`group cursor-pointer p-8 rounded-3xl border bg-gradient-to-br transition-all duration-300 hover:-translate-y-2 hover:shadow-lg active:scale-95 ${
                        colors[index % colors.length]
                      }`}
                    >
                      <div className="bg-white/50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <span className="text-xl font-bold">#</span>
                      </div>
                      <h3 className="font-bold text-xl truncate">
                        {room.name}
                      </h3>
                      <p className="text-xs font-bold uppercase tracking-widest opacity-60 mt-4 group-hover:opacity-100 transition-opacity">
                        Join Room &rarr;
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">
                  No active rooms found.
                </p>
                <Link
                  href="/create"
                  className="text-[#52ad8c] font-bold text-sm mt-2 block hover:underline"
                >
                  Create the first one!
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="max-w-md mx-auto py-10 animate-in fade-in zoom-in duration-300 text-center">
            <div className="w-20 h-20 bg-[#7ce7b7]/20 text-[#2d7a5d] rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-black">#</span>
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">
              Join {selectedRoom.name}
            </h2>
            <p className="text-slate-500 mb-8 font-medium">
              Identify yourself to join the conversation.
            </p>

            <div className="space-y-4">
              <input
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-[#7ce7b7]/20 focus:border-[#7ce7b7] transition-all text-lg"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <button
                onClick={joinRoom}
                className="w-full bg-[#7ce7b7] hover:bg-[#66d1a1] text-slate-800 font-bold py-4 rounded-2xl shadow-lg shadow-[#7ce7b7]/20 transition-all hover:-translate-y-1 active:scale-95"
              >
                Enter Chat Room
              </button>

              <button
                onClick={() => setSelectedRoom(null)}
                className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors py-2"
              >
                &larr; Choose a different room
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
