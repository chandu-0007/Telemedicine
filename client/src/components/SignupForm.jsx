import React, { useState } from "react";

const SignupForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "patient",
    address: "",
    latitude: "",
    longitude: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
    >
      <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
        Sign Up
      </h2>

      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
        className="w-full p-2 rounded-md border mb-3"
        required
      />

      <input
        type="tel"
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
        className="w-full p-2 rounded-md border mb-3"
        required
      />

      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="w-full p-2 rounded-md border mb-3"
      >
        <option value="patient">Patient</option>
        <option value="doctor">Doctor</option>
        <option value="pharmacy">Pharmacy</option>
      </select>

      <input
        type="text"
        name="address"
        placeholder="Address"
        value={formData.address}
        onChange={handleChange}
        className="w-full p-2 rounded-md border mb-3"
        required
      />

      <div className="flex gap-3 mb-4">
        <input
          type="number"
          name="latitude"
          placeholder="Latitude"
          value={formData.latitude}
          onChange={handleChange}
          className="w-1/2 p-2 rounded-md border"
          required
        />
        <input
          type="number"
          name="longitude"
          placeholder="Longitude"
          value={formData.longitude}
          onChange={handleChange}
          className="w-1/2 p-2 rounded-md border"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-500 transition"
      >
        Sign Up
      </button>
    </form>
  );
};

export default SignupForm;
