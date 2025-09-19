// src/pages/BookedAppointments.jsx
import React, { useEffect, useState } from "react";
import Skeleton from "../components/Skeleton";

export default function BookedAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("http://localhost:4000/appointments/my", {
          headers: { Authorization: localStorage.getItem("token") },
        });
        const data = await res.json();
        setAppointments(data.appointments || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) {
    return (
       <>
         <Skeleton/>
       </>
    );
  }

  return (
    <div>
        <div>
            <div>
                <img></img>
            </div>
        </div>
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">My Appointments</h1>
      {appointments.length === 0 ? (
        <p className="text-gray-600">No appointments booked yet.</p>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white p-4 rounded-lg shadow-md border"
            >
              <h2 className="font-semibold text-lg">
                {appt.doctor.user.name} ({appt.doctor.specialty})
              </h2>
              <p className="text-gray-600">
                📅 {new Date(appt.date).toLocaleString()}
              </p>
              {appt.notes && (
                <p className="text-gray-500 mt-1">📝 {appt.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
