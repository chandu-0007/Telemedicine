// inside DoctorDashboard (or wherever doctor listens)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

 export default function DoctorDashboard({user}) {
  const [incoming, setIncoming] = useState(null); // { patientId }
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("call:incoming", ({ patientId }) => {
      setIncoming({ patientId });
    });

    return () => {
      socket.off("call:incoming");
    };
  }, []);

  const accept = () => {
    if (!incoming) return;
    socket.emit("call:accept", { patientId: incoming.patientId });
    // navigate doctor to call room (route path expects remoteId param = patientUserId)
    navigate(`/call/${incoming.patientId}`);
    setIncoming(null);
  };

  const decline = () => {
    if (!incoming) return;
    socket.emit("call:cancel", { to: incoming.patientId });
    setIncoming(null);
  };

  return (
    <>
       <div>
        Hello doctor {user.name}
       </div>
      {/* ...existing dashboard UI */}
      {incoming && (
        <div className="fixed bottom-4 right-4 p-4 bg-white shadow rounded">
          <p>Incoming call from patient {incoming.patientId}</p>
          <div className="mt-2">
            <button onClick={accept} className="mr-2 bg-green-600 text-white px-3 py-1 rounded">Accept</button>
            <button onClick={decline} className="bg-gray-300 px-3 py-1 rounded">Decline</button>
          </div>
        </div>
      )}
    </>
  );
}
