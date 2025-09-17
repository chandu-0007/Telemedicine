import React, { useEffect, useRef } from "react";
import socket from "../socket";

export default function DoctorCall({ patientId, onEnd }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("signal", {
          to: patientId,
          type: "ice-candidate",
          payload: event.candidate,
        });
      }
    };

    // handle incoming signals
    socket.on("signal", async ({ from, type, payload }) => {
      if (from !== patientId) return;

      if (type === "offer") {
        // doctor only responds once patient sends offer
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        await pc.setRemoteDescription(new RTCSessionDescription(payload));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("signal", { to: from, type: "answer", payload: answer });
      } else if (type === "ice-candidate") {
        await pc.addIceCandidate(new RTCIceCandidate(payload));
      }
    });

    socket.on("call:ended", ({ from }) => {
      if (from === patientId) {
        alert("Patient ended the call.");
        endCall(false);
      }
    });

    return () => {
      // cleanup listeners without emitting
      socket.off("signal");
      socket.off("call:ended");
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [patientId]);

  const endCall = (notify = true) => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (notify) {
      socket.emit("call:end", { to: patientId });
    }
    if (onEnd) onEnd();
  };

  return (
    <div>
      <h2>Doctor Call</h2>
      <video ref={localVideoRef} autoPlay muted />
      <video ref={remoteVideoRef} autoPlay />
      <button
        onClick={() => endCall(true)}
        className="bg-red-600 text-white p-2 mt-2"
      >
        End Call
      </button>
    </div>
  );
}
