import React, { useEffect, useRef, useState } from "react";
import socket from "../socket";

export default function PatientCall({ doctor, onEnd }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("signal", {
          to: doctor.user.id,
          type: "ice-candidate",
          payload: event.candidate,
        });
      }
    };

    const startCall = async () => {
      try {
        // 1️⃣ get local media
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // 2️⃣ add tracks to peer connection
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // 3️⃣ create offer and send
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("signal", { to: doctor.user.id, type: "offer", payload: offer });
      } catch (err) {
        console.error("Error accessing camera/mic:", err);
        alert("Cannot access camera/microphone.");
      }
    };

    // 4️⃣ handle signals from doctor
    socket.on("signal", async ({ from, type, payload }) => {
      if (from !== doctor.user.id) return;

      if (type === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(payload));
      } else if (type === "ice-candidate") {
        await pc.addIceCandidate(new RTCIceCandidate(payload));
      }
    });

    socket.on("call:canceled", ({ from }) => {
      if (from === doctor.user.id) {
        alert("Doctor canceled the call.");
        cleanup();
      }
    });

    socket.on("call:ended", ({ from }) => {
      if (from === doctor.user.id) {
        alert("Doctor ended the call.");
        cleanup();
      }
    });

    startCall();

    return () => cleanup();

    function cleanup() {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      socket.off("signal");
      socket.off("call:canceled");
      socket.off("call:ended");
      if (onEnd) onEnd();
    }
  }, [doctor, onEnd]);

  const endCall = () => {
    socket.emit("call:end", { to: doctor.user.id });
    if (onEnd) onEnd();
  };

  return (
    <div>
      <h2>Calling {doctor.user.name}</h2>
      <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "45%", marginRight: "5%" }} />
      <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "45%" }} />
      <div>
        <button
          onClick={endCall}
          className="bg-red-600 text-white px-4 py-2 rounded mt-4"
        >
          End Call
        </button>
      </div>
    </div>
  );
}
