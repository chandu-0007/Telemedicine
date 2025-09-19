import React from "react";
import LoginForm from "../components/LoginForm";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const nav = useNavigate();

  const submitMethod = async (data) => {
    try {
      const res = await axios.post("http://localhost:4000/users/login", data, {
        headers: { "Content-Type": "application/json" },
      });

      const result = res.data;

      if (res.status === 200) {
        // Store token with Bearer prefix
        localStorage.setItem("token", `Bearer ${result.token}`);
        alert("Login successful!");
        nav("/dashboard/doctors"); // redirect after login
      } else {
        alert(result.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error, please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-50 p-4">
      <LoginForm onSubmit={submitMethod} />
    </div>
  );
};

export default LoginPage;
