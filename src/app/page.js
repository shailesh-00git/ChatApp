"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-[#f8fafc] p-6">
      {/* GLOW DECORATION */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-linear-to-b from-[#7ce7b7]/20 to-transparent blur-3xl -z-10" />

      {/* HEADER / LOGO SECTION */}
      <div className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900">
          Chat<span className="text-[#4ade80]">Off</span>
        </h1>
        <p className="text-slate-500 mt-3 text-lg font-medium">
          Simple. Secure. Instant disposal rooms.
        </p>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white w-full max-w-xl p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">
              Ready to start?
            </h2>
            <p className="text-slate-500 text-sm">
              Create a private space or join your friends using a room ID.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/create"
              className="w-full sm:w-auto bg-[#7ce7b7] hover:bg-[#66d1a1] text-slate-800 font-bold px-10 py-4 rounded-2xl shadow-lg shadow-[#7ce7b7]/30 transition-all hover:-translate-y-1 active:scale-95"
            >
              Create Room
            </Link>

            <Link
              href="/join"
              className="w-full sm:w-auto border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-10 py-4 rounded-2xl transition-all active:scale-95"
            >
              Join Room
            </Link>
          </div>
        </div>

        {/* FOOTER INFO */}
        <div className="mt-10 pt-8 border-t border-slate-50 flex justify-center md:gap-8 gap-3 text-slate-400 md:text-xs font-semibold uppercase tracking-widest  text-[11px]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#7ce7b7]" />
            Real-time
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#7ce7b7]" />
            No Logs
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#7ce7b7]" />
            Encrypted
          </div>
        </div>
      </div>

      {/* BOTTOM DECOR */}
      <p className="mt-8 text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} ChatOff. All rights reserved.
      </p>
    </main>
  );
}
