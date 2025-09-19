import axios from "axios";
import React, { useEffect, useState } from "react";

export default function HealthRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Unauthorized: No token found");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:4000/health-records", {
          headers: {
            Authorization: token,
          },
        });

        const data = res.data;
        if (data.success) {
          setRecords(data.records || []);
        } else {
          setError(data.error || "Failed to fetch records");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Loading health records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Your Health Records</h2>

      {records.length === 0 ? (
        <p className="text-gray-500">No health records uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => {
            const fileUrl = `http://localhost:4000${record.fileUrl}`;
            const isImage = record.type === "image" || record.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i);
            const isPdf = record.type === "pdf" || record.fileUrl.endsWith(".pdf");

            return (
              <div
                key={record.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-lg capitalize">{record.type}</h3>

                {record.details && (
                  <p className="text-gray-600 text-sm mt-1">{record.details}</p>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  Uploaded on: {new Date(record.createdAt).toLocaleDateString()}
                </p>

                {/* Preview Section */}
                <div className="mt-3">
                  {isImage ? (
                    <img
                      src={fileUrl}
                      alt="Health Record"
                      className="w-full h-40 object-cover rounded"
                    />
                  ) : isPdf ? (
                    <iframe
                      src={fileUrl}
                      title="PDF Preview"
                      className="w-full h-40 rounded border"
                    />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center bg-gray-100 text-gray-500 rounded">
                      No Preview
                    </div>
                  )}
                </div>

                {/* View Button */}
                {record.fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    View File
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
