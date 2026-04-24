import React from "react";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white rounded-2xl p-3 flex flex-col gap-2 shadow-sm">
      <div className="bg-[#AAF0D1] text-slate-800 font-medium rounded-xl p-3 cursor-pointer">
        Home
      </div>
      <div className="text-slate-500 hover:bg-gray-50 rounded-xl p-3 cursor-pointer transition-colors">
        Messages
      </div>
      <div className="text-slate-500 hover:bg-gray-50 rounded-xl p-3 cursor-pointer transition-colors">
        Groups
      </div>
      <div className="text-slate-500 hover:bg-gray-50 rounded-xl p-3 cursor-pointer transition-colors">
        Settings
      </div>
    </aside>
  );
};

export default Sidebar;
