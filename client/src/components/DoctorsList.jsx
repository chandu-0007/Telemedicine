import React, { useEffect, useState } from "react";
import socket from "../socket";
import { FaSearch, FaPhone, FaComments, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import BookAppointmentForm from "./BookAppointmentForm";
import ChatBot from "./Chatbot";

export default function DoctorsList({ token }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showChat, setShowChat] = useState(false); // ✅ toggle chatbot
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("https://telemedicine-2nan.onrender.com/doctors/available");
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
      <div className="flex justify-center items-center h-full">
        <p className="text-xl font-semibold">Loading doctors...</p>
      </div>
    );

  return (
    <div>
      <div className="p-6">
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
                      doc.isAvailable
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {doc.isAvailable ? "Available" : "Busy"}
                  </span>
                </div>
                <p className="text-gray-600">Specialty: {doc.specialty}</p>
                <p className="text-gray-600">
                  Experience: {doc.experience} years
                </p>
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

      {/* ✅ Floating Chat Button */}
      <button
        onClick={() => setShowChat((prev) => !prev)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        {showChat ? <FaTimes /> : <FaComments />}
      </button>

      {/* ✅ ChatBot Popup */}
      {showChat && (
        <div className="fixed bottom-20 right-6 w-80 h-96 bg-white shadow-2xl rounded-lg border overflow-hidden">
          <ChatBot onClose={() => setShowChat(false)} />
        </div>
      )}
    </div>
  );
}
