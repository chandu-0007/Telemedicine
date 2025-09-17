import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SingUpPage from "./pages/SingUpPage";
import LoginPage from "./pages/LoginPage";
import DashBoard from "./pages/DashBoard";
import LandingPage from "./pages/landingPage";
import CallRoom from "./components/CallRoom";
import BookedAppointments from "./pages/BookAppoinments"; // ✅ fix import name

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // check if token exists
  if (!token) {
    return <Navigate to="/users/login" replace />;
  }
  return children;
};

const App = () => {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* Redirect root (/) based on auth */}
        <Route
          path="/"
          element={
            token ? <Navigate to="/users/dashboard" replace /> : <LandingPage />
          }
        />

        {/* Public Routes */}
        <Route path="/users/register" element={<SingUpPage />} />
        <Route path="/users/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/users/dashboard"
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        />

        {/* Call Room for video/audio calls */}
        <Route
          path="/call/:doctorId"
          element={
            <ProtectedRoute>
              <CallRoom />
            </ProtectedRoute>
          }
        />

        {/* Booked Appointments */}
        <Route
          path="/users/appointments"
          element={
            <ProtectedRoute>
              <BookedAppointments />
            </ProtectedRoute>
          }
        />

        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen text-xl text-red-600">
              404 | Page Not Found
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
