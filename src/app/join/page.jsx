"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function JoinPage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  // Read username from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem("chat_username");
    setCurrentUser(stored);
  }, []);

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setRooms(data);
      setLoading(false);
    };
    fetchRooms();
  }, []);

  // ── Room card click ──
  const handleRoomClick = (room) => {
    // Always read fresh at click time
    const user = localStorage.getItem("chat_username");

    console.log("👤 currentUser:", user);
    console.log("🏠 room.created_by:", room.created_by);

    if (!user) {
      // No username yet → show username step
      setSelectedRoom(room);
      return;
    }

    if (user === room.created_by) {
      // Creator → enter directly
      toast.success(`Welcome back to ${room.name}!`);
      router.push(`/room/${room.id}`);
    } else {
      // Not creator → block
      toast.error("Only the room creator can join directly. Use a room code.");
    }
  };

  // ── Verify code ──
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const cleanCode = roomCode.trim().toUpperCase();

    if (cleanCode.length < 6) {
      toast.error("Please enter a 6-character code");
      return;
    }

    setJoining(true);

    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("room_code", cleanCode)
        .single();

      if (error || !data) {
        toast.error("Invalid Room Code. Please check and try again.");
      } else {
        setSelectedRoom(data);
        toast.success(`Room "${data.name}" found!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setJoining(false);
    }
  };

  // ── Join with username ──
  const joinRoom = () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    localStorage.setItem("chat_username", username.trim());
    setCurrentUser(username.trim());
    router.push(`/room/${selectedRoom.id}`);
  };

  return (
    <main className="max-h-dvh flex flex-col items-center justify-center bg-[#f8fafc] p-3 sm:p-4 md:p-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-linear-to-b from-[#7ce7b7]/10 to-transparent blur-3xl -z-10" />

      <div className="w-full max-w-5xl bg-white p-4 sm:p-6 md:p-10 rounded-[1.75rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 transition-all">
        {/* Header */}
        <div className="flex flex-row justify-between items-center mb-6 sm:mb-8 gap-4 p-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              Public <span className="text-[#4ade80]">Rooms</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
              Browse rooms or join with a code.
            </p>
          </div>
          <Link href={"/"}>
            <button className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-bold py-2 px-3 sm:px-4 rounded-xl hover:bg-slate-50 transition-all text-sm">
              &larr; <span className="hidden sm:inline">Back Home</span>
              <span className="sm:hidden">Back</span>
            </button>
          </Link>
        </div>

        {!selectedRoom ? (
          <>
            {/* JOIN BY CODE */}
            <div className="mb-6 sm:mb-10 p-5 sm:p-8 bg-slate-50 rounded-2xl sm:rounded-4xl border border-slate-100 flex flex-col items-center text-center">
              <h2 className="text-lg sm:text-2xl font-black text-slate-800 mb-1 sm:mb-2">
                Join with Code
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mb-4 sm:mb-6">
                Enter the 6-character room code to enter
              </p>

              <form
                onSubmit={handleVerifyCode}
                className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full max-w-md"
              >
                <input
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="EX: 7X2K9L"
                  className="flex-1 bg-white border border-slate-200 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 outline-none focus:ring-4 focus:ring-[#7ce7b7]/20 focus:border-[#7ce7b7] transition-all text-center font-mono text-lg sm:text-xl tracking-[0.2em] uppercase"
                />
                <button
                  type="submit"
                  disabled={joining}
                  className="bg-[#7ce7b7] hover:bg-[#66d1a1] text-slate-800 font-bold px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl transition-all active:scale-95 disabled:opacity-50 shadow-md"
                >
                  {joining ? "Searching..." : "Verify"}
                </button>
              </form>
            </div>

            {/* ROOMS GRID */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 space-y-4">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-[#7ce7b7] rounded-full animate-spin" />
                <div className="text-slate-400 font-medium animate-pulse text-sm">
                  Loading rooms...
                </div>
              </div>
            ) : rooms.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {rooms.map((room, index) => {
                  const colors = [
                    "from-amber-50 to-amber-100/50 text-amber-700 border-amber-200",
                    "from-sky-50 to-sky-100/50 text-sky-700 border-sky-200",
                    "from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200",
                    "from-rose-50 to-rose-100/50 text-rose-700 border-rose-200",
                  ];

                  const isCreator =
                    currentUser &&
                    room.created_by &&
                    currentUser === room.created_by;

                  return (
                    <div
                      key={room.id}
                      onClick={() => handleRoomClick(room)}
                      className={`relative p-4 sm:p-6 rounded-2xl sm:rounded-3xl border bg-linear-to-br transition-all hover:shadow-md cursor-pointer select-none active:scale-95 ${
                        colors[index % colors.length]
                      } ${isCreator ? "ring-2 ring-[#7ce7b7] ring-offset-1" : ""}`}
                    >
                      {/* Creator badge */}
                      {isCreator && (
                        <span className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-[#7ce7b7] text-slate-700 px-1.5 py-0.5 rounded-full shadow-sm">
                          Your Room
                        </span>
                      )}

                      <div className="bg-white/50 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-2 sm:mb-3 shadow-sm">
                        <span className="text-sm sm:text-lg font-bold">#</span>
                      </div>

                      <h3 className="font-bold text-sm sm:text-lg truncate mb-1 pr-12">
                        {room.name}
                      </h3>

                      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-60">
                        {isCreator ? "✓ Tap to Enter" : "Code Required"}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 sm:py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium text-sm">
                  No active rooms found.
                </p>
              </div>
            )}
          </>
        ) : (
          /* USERNAME STEP */
          <div className="max-w-md mx-auto py-8 sm:py-10 animate-in fade-in zoom-in duration-300 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#7ce7b7]/20 text-[#2d7a5d] rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-5 sm:mb-6">
              <span className="text-2xl sm:text-3xl font-black">#</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
              Join {selectedRoom.name}
            </h2>
            <p className="text-slate-500 mb-6 sm:mb-8 font-medium text-sm sm:text-base">
              Almost there! Choose a username to enter.
            </p>

            <div className="space-y-3 sm:space-y-4">
              <input
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 sm:px-6 py-3 sm:py-4 outline-none focus:ring-4 focus:ring-[#7ce7b7]/20 focus:border-[#7ce7b7] transition-all text-base sm:text-lg"
                placeholder="What's your name?"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && joinRoom()}
              />

              <button
                onClick={joinRoom}
                className="w-full bg-[#7ce7b7] hover:bg-[#66d1a1] text-slate-800 font-bold py-3 sm:py-4 rounded-2xl shadow-lg shadow-[#7ce7b7]/20 transition-all hover:-translate-y-1 active:scale-95"
              >
                Enter Chat Room
              </button>

              <button
                onClick={() => setSelectedRoom(null)}
                className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors py-2"
              >
                &larr; Use a different code
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
