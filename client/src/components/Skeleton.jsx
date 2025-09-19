import React from "react";

export default function Skeleton({ lines = 10 }) {
  return (
    <div className="animate-pulse space-y-3 ">
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="h-5 bg-gray-300 rounded w-full"
        ></div>
      ))}
    </div>
  );
}
