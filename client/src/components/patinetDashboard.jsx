import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { FaUserCircle, FaCalendarAlt, FaNotesMedical, FaUserMd } from "react-icons/fa";
import UserProfile from "./UserProfile";

export default function PatientDashboard({ user, userName }) {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Fixed Top Bar */}
      <div className="sticky top-0 z-50 bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Welcome, {userName}</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/doctors")}
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <FaUserMd /> Doctors
          </button>
          <button
            onClick={() => navigate("/dashboard/appointments")}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <FaCalendarAlt /> Appointments
          </button>
          <button
            onClick={() => navigate("/dashboard/health-records")}
            className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <FaNotesMedical /> Health Records
          </button>
          <div
            onClick={() => setShowProfile(!showProfile)}
            className="cursor-pointer"
          >
            <FaUserCircle className="text-3xl text-gray-700" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        <Outlet /> {/* 👈 Nested routes render here */}
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <UserProfile user={user} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}
