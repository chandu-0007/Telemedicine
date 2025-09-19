import React from "react";

export default function UserProfile({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
        >
          ✖
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-600">
            {user.name.charAt(0)}
          </div>
          <h2 className="mt-3 text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-500">{user.phone}</p>
          <p className="text-sm text-blue-600 font-medium mt-1 capitalize">
            Role: {user.role}
          </p>
        </div>

        {/* Extra Info */}
        <div className="mt-6 space-y-2 text-sm text-gray-700">
          <p>
            <strong>Address:</strong> {user.address || "Not provided"}
          </p>
          <p>
            <strong>Joined:</strong>{" "}
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
