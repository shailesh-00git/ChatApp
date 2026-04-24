import ChatSection from "@/components/chatSection";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import Link from "next/link";

function Home() {
  return (
    <main className="h-screen w-7xl mx-auto p-4 bg-[#f0eded] flex flex-col gap-4">
      <Header></Header>
      <div className="flex flex-row gap-4 flex-1 overflow-hidden pb-4">
        <Sidebar />
        <ChatSection />
      </div>
    </main>
  );
}

export default Home;
