import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SingUpPage from "./pages/SingUpPage";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/landingPage"
import CallRoom from "./components/CallRoom";
import PatientDashboard from "./components/patinetDashboard";
import DoctorsList from "./components/DoctorsList";
import BookedAppointments from "./pages/BookAppoinments"
import UploadHealthRecord from "./components/UploadHealthRecord";
import Dashboard from "./pages/DashBoard";
import axios from "axios";
import { useState } from "react";

// Protected Route
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/users/login" replace />;
  return children;
};

const App = () => {
  const token = localStorage.getItem("token");
  const [userDetails, setUserDetails] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:4000/users/me", {
          headers: {
            Authorization: localStorage.getItem("token"), // token includes "Bearer "
          },
        });
        setUserDetails(res.data.user);
        console.log(res.data)
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);
  return (
    <Router>
      <Routes>
        {/* Root redirect */}
        <Route
          path="/"
          element={token ? <Navigate to="/dashboard/doctors" replace /> : <LandingPage />}
        />

        {/* Public */}
        <Route path="/users/register" element={<SingUpPage />} />
        <Route path="/users/login" element={<LoginPage />} />

        {/* Protected Dashboard with nested routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard user={userDetails} />
            </ProtectedRoute>
          }
        >
          <Route path="doctors" element={<DoctorsList token={token} />} />
          <Route path="appointments" element={<BookedAppointments />} />
          <Route path="health-records" element={<UploadHealthRecord />} />
        </Route>

        {/* Call room */}
        <Route path="/call/:remoteId" element={
          <ProtectedRoute>
            <CallRoom  user={userDetails}/>
          </ProtectedRoute>
        } />


        {/* 404 */}
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
