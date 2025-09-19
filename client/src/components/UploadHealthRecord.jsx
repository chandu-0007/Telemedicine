import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HealthRecordsPage from "./HealthRecords";

export default function UploadHealthRecord() {
  const [file, setFile] = useState(null);
  const [type, setType] = useState("pdf");
  const [details, setDetails] = useState("");
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please choose a file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("details", details);

    try {
      const res = await fetch("http://localhost:4000/health-records", {
        method: "POST",
        headers: { Authorization: localStorage.getItem('token') },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert("Record uploaded successfully!");
      } else {
        alert("Failed: " + data.error);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Error uploading record");
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-lg font-bold mb-4">Upload Health Record</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="border p-2 rounded"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="pdf">PDF</option>
          <option value="image">Image</option>
          <option value="text">Text</option>
        </select>
        <textarea
          placeholder="Details (optional)"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Upload
        </button>
      </form>

       {/* All his health records  */}
       <div>
        <HealthRecordsPage/>
       </div>
    </div>
  );
}
