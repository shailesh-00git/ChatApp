import Link from "next/link";

function Home() {
  return (
    <main className="h-screen w-7xl mx-auto p-2">
      {/* header */}
      <header className="border flex justify-between items-center py-3 px-8">
        <h1 className="text-3xl text-cyan-800">ChatOff</h1>
        <nav className="flex justify-center items-center gap-3">
          <button className="bg-cyan-800 text-white px-3 rounded-lg py-1">
            Sign up
          </button>
          <button className="bg-cyan-800 text-white px-3 rounded-lg py-1">
            Login
          </button>
        </nav>
      </header>

      {/* main */}
      <div className="flex flex-row h-140">
        <aside className="flex-1 border p-2 flex flex-col gap-3">
          <div className="bg-cyan-700 text-white rounded p-3">Home</div>
          <div className="bg-cyan-700 text-white rounded p-3">Home</div>{" "}
          <div className="bg-cyan-700 text-white rounded p-3">Home</div>{" "}
          <div className="bg-cyan-700 text-white rounded p-3">Home</div>{" "}
        </aside>
        {/* main */}
        <main className="flex-5 border">
          <div className="flex flex-col h-full">
            <div className="flex-1 ">message area</div>
            <div className="border p-3 flex justify-end items-center gap-2">
              <span className="bg-cyan-800 text-white px-3 rounded-2xl py-1">
                +
              </span>
              <input
                type="text"
                className="px-2 py-1 border  rounded-2xl"
                placeholder="message"
              />
              <button className="bg-cyan-800 text-white px-3 rounded-2xl py-1">
                send
              </button>
            </div>
          </div>
        </main>
      </div>
    </main>
  );
}

export default Home;
