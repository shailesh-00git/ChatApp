"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreatePage() {
  const [roomName, setRoomName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const router = useRouter();

  // --- HELPER: GENERATE 6 DIGIT CODE ---
  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createRoom = async (e) => {
    e.preventDefault();
    setRoomLoading(true);
    setError(null);

    if (!username || !roomName) {
      setError("Username & Roomname are required");
      setRoomLoading(false);
      return;
    }

    try {
      // 1. CHECK IF ROOM NAME EXISTS
      const { data: existingRoom, error: checkError } = await supabase
        .from("rooms")
        .select("id")
        .eq("name", roomName)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingRoom) {
        setError("That room name is already taken");
        setRoomLoading(false);
        return;
      }

      // 2. GENERATE THE UNIQUE JOIN CODE
      const newRoomCode = generateRoomCode();

      // 3. CREATE ROOM WITH ROOM_CODE
      const { data, error: insertError } = await supabase
        .from("rooms")
        .insert({ 
            name: roomName, 
            created_by: username,
            room_code: newRoomCode // This maps to your new column
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 4. SAVE USERNAME & REDIRECT
      localStorage.setItem("chat_username", username);
      router.push(`/room/${data.id}`); // URL uses UUID, but code is stored in DB
      
    } catch (err) {
      setError(err.message);
    } finally {
      setRoomLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-to-b from-[#7ce7b7]/15 to-transparent blur-3xl -z-10" />

      <div className="w-full max-w-xl bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Create<span className="text-[#4ade80]">Room</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Start a new conversation</p>
          </div>
          <Link href={"/"}>
            <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold py-2 px-4 rounded-xl hover:bg-slate-50 transition-all">
              &larr; Back
            </button>
          </Link>
        </div>

        <form onSubmit={createRoom} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Room Name</label>
            <input
              placeholder="e.g. Design Team"
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-[#7ce7b7]/20 focus:border-[#7ce7b7] transition-all text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Your Username</label>
            <input
              placeholder="e.g. Alex"
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-[#7ce7b7]/20 focus:border-[#7ce7b7] transition-all text-lg"
            />
          </div>

          {error && (
            <div className="p-4 text-center text-rose-500 bg-rose-50 border border-rose-100 rounded-2xl text-sm font-semibold">
              {error}
            </div>
          )}

          <button
            disabled={roomLoading}
            className="w-full bg-[#7ce7b7] hover:bg-[#66d1a1] text-slate-800 font-bold py-5 rounded-2xl shadow-lg shadow-[#7ce7b7]/20 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 text-xl mt-4"
          >
            {roomLoading ? "Creating..." : "Launch Room"}
          </button>
        </form>
      </div>
    </main>
  );
}