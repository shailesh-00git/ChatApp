import React from "react";

const Header = () => {
  return (
    <header className="bg-white shadow-sm rounded-2xl flex justify-between items-center py-4 px-8">
      <h1 className="text-3xl font-bold text-slate-800">
        Chat<span className="text-[#52ad8c]">Off</span>
      </h1>
      <nav className="flex justify-center items-center gap-3">
        <button className="text-slate-600 font-medium px-4 py-2 hover:text-slate-900 transition-colors">
          Sign up
        </button>
        <button className="bg-[#AAF0D1] text-slate-800 font-semibold px-6 py-2 rounded-xl hover:bg-[#8ee4bc] transition-all shadow-sm">
          Login
        </button>
      </nav>
    </header>
  );
};

export default Header;
