import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SingUpPage from "./pages/SingUpPage";
import LoginPage from "./pages/LoginPage";// future protected page
import DashBoard from "./pages/DashBoard"
import LandingPage from "./pages/landingPage";
// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // check if token exists

  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/users/login" replace />;
  }

  return children; // else render the protected page
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage/>} />
        <Route path="/users/register" element={<SingUpPage/>} />
        <Route path="/users/login" element={<LoginPage/>} />

        {/* Protected Routes */}
        <Route
          path="/users/dashboard"
          element={
            <ProtectedRoute>
              <DashBoard/>
            </ProtectedRoute>
          }
        ></Route>

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
