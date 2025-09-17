import React, { useEffect, useState } from "react";
import socket from "../socket";
import { FaSearch, FaUserCircle, FaCalendarAlt, FaNotesMedical, FaPhone } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import BookAppointmentForm from "./BookAppointmentForm";

export default function PatientDashboard({ userId, token, userName }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null); // for appointment modal
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("http://localhost:4000/doctors/available", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDoctors(data.doctors || []);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();

    socket.on("presence:update", (updates) => {
      setDoctors((prev) =>
        prev.map((doc) => {
          const update = updates.find((u) => u.userId === doc.userId);
          return update ? { ...doc, isAvailable: update.available } : doc;
        })
      );
    });

    return () => socket.off("presence:update");
  }, [token]);

  const handleCall = (doctorId) => {
    navigate(`/call/${doctorId}`);
  };

  const handleBook = (doctorId) => {
    setSelectedDoctor(doctorId);
  };

  const filteredDoctors = doctors.filter((doc) =>
    doc.specialty.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading doctors...</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {userName}</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={()=>{navigate("/users/appointments")}}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
            <FaCalendarAlt /> Booked Appointment
          </button>
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition">
            <FaNotesMedical /> Health Records
          </button>
          <div className="flex items-center gap-2 cursor-pointer">
            <FaUserCircle className="text-3xl text-gray-700" />
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredDoctors.length === 0 ? (
          <p className="text-gray-500 col-span-full">No doctors found</p>
        ) : (
          filteredDoctors.map((doc) => (
            <div
              key={doc.user.id}
              className="bg-white p-4 rounded-xl shadow hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{doc.user.name}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    doc.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {doc.isAvailable ? "Available" : "Busy"}
                </span>
              </div>
              <p className="text-gray-600">Specialty: {doc.specialty}</p>
              <p className="text-gray-600">Experience: {doc.experience} years</p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => handleCall(doc.user.id)}
                  disabled={!doc.isAvailable}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <FaPhone /> Call
                </button>
                <button
                  onClick={() => handleBook(doc.user.id)}
                  className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Appointment Modal */}
      {selectedDoctor && (
        <BookAppointmentForm
          doctorId={selectedDoctor}
          token={token}
          onClose={() => setSelectedDoctor(null)}
          onSuccess={(appt) => console.log("Booked:", appt)}
        />
      )}
    </div>
  );
}
