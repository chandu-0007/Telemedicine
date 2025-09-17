import React, { useEffect, useRef, useState } from "react";
import socket from "../socket";

export default function CallRoom({ remoteUserId, localUserId, onEnd }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    // Remote stream
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("signal", { to: remoteUserId, type: "ice-candidate", payload: event.candidate });
      }
    };

    const initLocalStream = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    };

    initLocalStream();

    socket.on("signal", async ({ from, type, payload }) => {
      if (type === "offer") {
        await pc.setRemoteDescription(payload);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("signal", { to: from, type: "answer", payload: answer });
        setInCall(true);
      } else if (type === "answer") {
        await pc.setRemoteDescription(payload);
        setInCall(true);
      } else if (type === "ice-candidate") {
        await pc.addIceCandidate(payload);
      }
    });

    socket.on("call:ended", () => endCall());

    return () => {
      endCall();
      socket.off("signal");
      socket.off("call:ended");
    };
  }, [remoteUserId]);

  const endCall = () => {
    if (pcRef.current) pcRef.current.close();
    setInCall(false);
    if (onEnd) onEnd();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4">
        <video ref={localVideoRef} autoPlay muted className="w-48 h-48 rounded-lg border" />
        <video ref={remoteVideoRef} autoPlay className="w-96 h-96 rounded-lg border" />
      </div>
      {inCall && (
        <button
          onClick={() => {
            socket.emit("call:end", { to: remoteUserId });
            endCall();
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg mt-2"
        >
          End Call
        </button>
      )}
    </div>
  );
}
