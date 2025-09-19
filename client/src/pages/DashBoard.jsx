import { useEffect, useState } from "react";
import axios from "axios";
import DoctorDashboard from "../components/doctorDashboard";
import PatientDashboard from "../components/patinetDashboard";
import Skeleton from "../components/Skeleton";
const Dashboard = ({user}) => {
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

  if (!userDetails) {
    return <>
        <Skeleton/>
    </>
  }

  return (
    <div className="p-2">
         
      {/* Conditional rendering by role */}
      {userDetails.role === "patient" && (
        <div>
          <PatientDashboard user={user} userName={userDetails.name}/>
        </div>
      )}

      {userDetails.role === "doctor" && (
        <div>
            <DoctorDashboard user={userDetails}/>
          </div>
      )}

      {userDetails.role === "pharmacy" && (
        <div>
           <PatientDashboard />
          </div>
      )}
    </div>
  );
};

export default Dashboard;
