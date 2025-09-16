import React from "react";
import SignupForm from "../components/SignupForm";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SingUpPage = () => {
  const nav = useNavigate();

  const submitMethod = async (formData) => {
    try {
      const res = await axios.post("http://localhost:4000/users/register", formData, {
        headers: { "Content-Type": "application/json" },
      });

      const data = res.data;
      console.log(data);

      if (res.status === 201) { // registration success
       localStorage.setItem("token", `Bearer ${data.token}`);
        alert("Registered successfully!");

        nav("/users/dashboard"); // make sure you have this route
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error, please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-50 p-4">
      <SignupForm onSubmit={submitMethod} />
    </div>
  );
};

export default SingUpPage;
