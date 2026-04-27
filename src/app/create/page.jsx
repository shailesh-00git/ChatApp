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
      // 1. CHECK IF ROOM EXISTS
      const { data: existingRoom, error: checkError } = await supabase
        .from("rooms")
        .select("id")
        .eq("name", roomName)
        .maybeSingle();

      if (checkError) {
        setError(checkError.message);
        setRoomLoading(false);
        return;
      }

      if (existingRoom) {
        setError("Room already exists");
        setRoomLoading(false);
        return;
      }

      // 2. CREATE ROOM
      const { data, error: insertError } = await supabase
        .from("rooms")
        .insert({ name: roomName, created_by: username })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        setRoomLoading(false);
        return;
      }

      // if success redirect
      router.push(`/room/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setRoomLoading(false);
    }
  };

  return (
    <main className="h-screen grid place-content-center shadow-sm bg-[#f0eded] min-w-7xl mx-auto">
      <div className="w-xl bg-white py-12 px-8 rounded-xl">
        <div className="flex justify-between items-center px-2 mb-4">
          <h1 className="text-4xl font-bold mb-6">
            Create<span className="text-[#52ad8c]">Room</span>
          </h1>
          <Link href={"/"}>
            <button className="bg-[#AAF0D1] px-6 py-2 rounded-xl">Back</button>
          </Link>
        </div>

        <form
          onSubmit={createRoom}
          className="space-y-3 rounded-xl flex flex-col "
        >
          <input
            placeholder="Room Name"
            onChange={(e) => setRoomName(e.target.value)}
            className="border rounded-lg p-4"
          />
          <input
            placeholder="username"
            onChange={(e) => setUsername(e.target.value)}
            className="border rounded-lg p-4"
          />
          {/* error div */}
          {error && (
            <div className="p-3 text-center text-orange-500 border border-dashed rounded-2xl">
              {error}
            </div>
          )}

          <button className="bg-[#AAF0D1] px-6 py-3 text-2xl rounded-2xl mt-4">
            {roomLoading ? "creating..." : "Create Room"}{" "}
          </button>
        </form>
      </div>
    </main>
  );
}
