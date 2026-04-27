"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner"; // Assuming you use sonner for better UI

export default function JoinPage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomCode, setRoomCode] = useState(""); 
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const router = useRouter();

  // Fetch rooms for display only
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

  // Logical step: Find room by 6-char room_code column
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    // Clean input: No spaces and all uppercase
    const cleanCode = roomCode.trim().toUpperCase();

    if (cleanCode.length < 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setJoining(true);

    try {
      // SEARCH: Look in the room_code column specifically
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("room_code", cleanCode)
        .single();

      if (error || !data) {
        toast.error("Invalid Room Code. Please check and try again.");
        setJoining(false);
      } else {
        // Success! The room exists, now move to the username step
        setSelectedRoom(data);
        setJoining(false);
        toast.success(`Room "${data.name}" found!`);
      }
    } catch (err) {
      console.error(err);
      setJoining(false);
    }
  };

  const joinRoom = () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    
    // Save identity for the session
    localStorage.setItem("chat_username", username);
    
    // REDIRECT: Use the UUID (selectedRoom.id) for the URL route
    router.push(`/room/${selectedRoom.id}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4 md:p-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-to-b from-[#7ce7b7]/10 to-transparent blur-3xl -z-10" />

      <div className="w-full max-w-5xl bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 transition-all">
        {!selectedRoom ? (
          <>
            {/* JOIN BY CODE SECTION */}
            <div className="mb-12 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center">
              <h2 className="text-2xl font-black text-slate-800 mb-2">Join with Code</h2>
              <p className="text-slate-500 text-sm mb-6">Enter the 6-character room code to enter</p>
              
              <form onSubmit={handleVerifyCode} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <input
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="EX: 7X2K9L"
                  className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-3 outline-none focus:ring-4 focus:ring-[#7ce7b7]/20 focus:border-[#7ce7b7] transition-all text-center font-mono text-xl tracking-[0.2em] uppercase"
                />
                <button 
                  type="submit"
                  disabled={joining}
                  className="bg-[#7ce7b7] hover:bg-[#66d1a1] text-slate-800 font-bold px-8 py-3 rounded-2xl transition-all active:scale-95 disabled:opacity-50 shadow-md"
                >
                  {joining ? "Searching..." : "Verify"}
                </button>
              </form>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                  Public <span className="text-[#4ade80]">Rooms</span>
                </h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">
                  Select a room to see details or join by code above.
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
                <div className="text-slate-400 font-medium animate-pulse">Loading rooms...</div>
              </div>
            ) : rooms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rooms.map((room, index) => {
                  const colors = [
                    "from-amber-50 to-amber-100/50 text-amber-700 border-amber-200",
                    "from-sky-50 to-sky-100/50 text-sky-700 border-sky-200",
                    "from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200",
                    "from-rose-50 to-rose-100/50 text-rose-700 border-rose-200",
                  ];

                  return (
                    <div
                      key={room.id}
                      className={`p-6 rounded-3xl border bg-gradient-to-br transition-all hover:shadow-md ${
                        colors[index % colors.length]
                      }`}
                    >
                      <div className="bg-white/50 w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm">
                        <span className="text-lg font-bold">#</span>
                      </div>
                      <h3 className="font-bold text-lg truncate mb-1">{room.name}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                        Code Required
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No active rooms found.</p>
              </div>
            )}
          </>
        ) : (
          /* USERNAME STEP */
          <div className="max-w-md mx-auto py-10 animate-in fade-in zoom-in duration-300 text-center">
            <div className="w-20 h-20 bg-[#7ce7b7]/20 text-[#2d7a5d] rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-black">#</span>
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Join {selectedRoom.name}</h2>
            <p className="text-slate-500 mb-8 font-medium">Almost there! Choose a username to enter.</p>

            <div className="space-y-4">
              <input
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-[#7ce7b7]/20 focus:border-[#7ce7b7] transition-all text-lg"
                placeholder="What's your name?"
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
                &larr; Use a different code
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}