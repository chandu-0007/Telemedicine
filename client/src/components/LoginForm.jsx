import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const LoginForm = ({ onSubmit }) => {
  const [phone, setPhone] = useState("");
  const nav = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ phone });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
    >
      <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
        Login
      </h2>

      <input
        type="tel"
        name="phone"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full p-2 rounded-md border mb-6"
        required
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-500 transition"
      >
        Login
      </button>
      <div>
        <span>If you doesn't have accoutn </span>
        <span className="text-blue-400 hover:text-blue-800 curser-pointer" onClick={()=>{nav("/users/register")}}>Link here </span></div>
    </form>
  );
};

export default LoginForm;
