import React, { useState } from "react";

export default function BookAppointmentForm({ doctorId, token, onClose, onSuccess }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !time) {
      alert("Please select date and time.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://telemedicine-2nan.onrender.com/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem('token'),
        },
        body: JSON.stringify({
          doctorId,
          date: new Date(`${date}T${time}`),
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Appointment booked successfully!");
        onSuccess?.(data.appointment);
        onClose();
      } else {
        alert(`❌ Failed: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error booking appointment:", err);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Book Appointment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-lg p-2"
              rows="3"
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Booking..." : "Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
