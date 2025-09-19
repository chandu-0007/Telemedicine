// src/components/DoctorNotesModal.jsx
import React, { useState } from "react";

export default function DoctorNotesModal({ patientUserId, onClose, onSaved }) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const saveNotes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientUserId, // user id of patient (not patient table id)
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onSaved && onSaved(data);
    } catch (err) {
      console.error(err);
      alert("Failed to save notes.");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">Doctor Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter consultation notes..."
          className="w-full border rounded p-2 h-36"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
          <button onClick={saveNotes} disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded">
            {loading ? "Saving..." : "Save & Finish"}
          </button>
        </div>
      </div>
    </div>
  );
}
