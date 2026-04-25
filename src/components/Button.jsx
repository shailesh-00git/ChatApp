import React from "react";

const Button = ({ name }) => {
  return (
    <button className="bg-[#AAF0D1] text-slate-800 font-semibold px-6 py-2 rounded-xl hover:bg-[#8ee4bc] transition-all shadow-sm">
      {name}
    </button>
  );
};

export default Button;
