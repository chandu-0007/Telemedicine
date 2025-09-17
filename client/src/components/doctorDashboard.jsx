import React, { useEffect, useRef, useState } from "react";
import socket from "../socket";

export default function DoctorDashboard({ userId }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);

  const [incomingCall, setIncomingCall] = useState(null); // patientId
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    socket.on("call:incoming", ({ patientId }) => {
      console.log("📞 Incoming call from patient", patientId);
      setIncomingCall({ patientId });
    });

    socket.on("call:canceled", ({ from }) => {
      alert(`Patient ${from} canceled the call.`);
      setIncomingCall(null);
      cleanup();
    });

    socket.on("call:ended", ({ from }) => {
      alert(`Patient ${from} ended the call.`);
      cleanup();
    });

    socket.on("signal", async ({ from, type, payload }) => {
      if (type === "offer") {
        // create peer connection
        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        pc.ontrack = (event) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("signal", {
              to: from,
              type: "ice-candidate",
              payload: event.candidate,
            });
          }
        };

        // Add doctor’s media
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        await pc.setRemoteDescription(new RTCSessionDescription(payload));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("signal", { to: from, type: "answer", payload: answer });
        setInCall(true);
      } else if (type === "ice-candidate") {
        pcRef.current?.addIceCandidate(new RTCIceCandidate(payload));
      }
    });

    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    setInCall(false);
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setIncomingCall(null);
  };

  const acceptCall = () => {
    if (!incomingCall) return;
    socket.emit("call:accept", { patientId: incomingCall.patientId });
    setIncomingCall(null); // hide incoming UI
  };

  const declineCall = () => {
    if (!incomingCall) return;
    socket.emit("call:cancel", { to: incomingCall.patientId });
    setIncomingCall(null);
  };

  const endCall = () => {
    if (!inCall) return;
    socket.emit("call:end", { to: incomingCall?.patientId });
    cleanup();
  };

  return (
    <div>
      <h2>Doctor Dashboard</h2>

      {/* Incoming call UI */}
      {incomingCall && !inCall && (
        <div className="mt-4">
          <p>Incoming call from patient {incomingCall.patientId}</p>
          <button
            onClick={acceptCall}
            className="bg-green-500 text-white p-2 mr-2 rounded"
          >
            Accept
          </button>
          <button
            onClick={declineCall}
            className="bg-gray-500 text-white p-2 rounded"
          >
            Decline
          </button>
        </div>
      )}

      {/* Active call */}
      {inCall && (
        <div className="mt-4">
          <video ref={localVideoRef} autoPlay muted />
          <video ref={remoteVideoRef} autoPlay />
          <button
            onClick={endCall}
            className="bg-red-600 text-white p-2 mt-2 rounded"
          >
            End Call
          </button>
        </div>
      )}
    </div>
  );
}
