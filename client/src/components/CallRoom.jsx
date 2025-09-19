// src/components/CallRoom.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";
import DoctorNotesModal from "./DoctorNotesModal";

/** helper to decode token payload (not secure, but fine for client-side role detection) */
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function CallRoom({user}) {
  const { remoteId } = useParams(); // remote userId (doctor for patient; patient for doctor)
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  // const user = token ? decodeToken(token) : null;
  const role = user?.role; // "patient" or "doctor"
  const myUserId = user?.id;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle, waiting, in-call, ended
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [callPartnerUserId, setCallPartnerUserId] = useState(Number(remoteId));

  const STUN_CONFIG = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  useEffect(() => {
    if (!token || !user) {
      alert("Unauthorized — please login");
      navigate("/users/login");
      return;
    }

    // Handlers used by both roles
    const onSignal = async ({ from, type, payload }) => {
      const pc = pcRef.current;
      if (!pc) return;

      try {
        if (type === "offer") {
          // Doctor receives offer, answer
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("signal", { to: from, type: "answer", payload: pc.localDescription });
          setStatus("in-call");
        } else if (type === "answer") {
          // Patient receives answer
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
          setStatus("in-call");
        } else if (type === "ice-candidate") {
          await pc.addIceCandidate(new RTCIceCandidate(payload));
        }
      } catch (err) {
        console.error("signal handler error:", err);
      }
    };

    const onCallCanceled = ({ from }) => {
      alert("Call canceled by remote");
      cleanupAndNavigate();
    };

    const onCallEnded = ({ from }) => {
      // remote ended the call
      cleanupRtc();
      if (role === "doctor") {
        // show notes modal for doctor with patientUserId = from
        setCallPartnerUserId(from);
        setShowNotesModal(true);
      } else {
        // patient: go back to dashboard
        navigate("/dashboard/doctors");
      }
    };

    socket.on("signal", onSignal);
    socket.on("call:canceled", onCallCanceled);
    socket.on("call:ended", onCallEnded);

    // Role-specific initial actions
    if (role === "patient") {
      startPatientFlow();
    } else if (role === "doctor") {
      // Doctor just waits for offer (they will be navigated to this route after accepting)
      setStatus("waiting-for-offer");
      // create RTCPeerConnection now so it can accept ICE candidates early
      createPeerConnection();
    } else {
      alert("Unknown role");
      navigate("/users/login");
    }

    // Cleanup on unmount
    return () => {
      socket.off("signal", onSignal);
      socket.off("call:canceled", onCallCanceled);
      socket.off("call:ended", onCallEnded);
      cleanupRtc();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteId]);

  // ---------- Helpers ----------

  const createPeerConnection = () => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection(STUN_CONFIG);
    pcRef.current = pc;

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("signal", { to: Number(remoteId), type: "ice-candidate", payload: event.candidate });
      }
    };

    return pc;
  };

  const getLocalStream = async () => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  const startPatientFlow = async () => {
    setStatus("requesting");
    // 1) tell server you want to call the doctor
    socket.emit("call:request", { doctorId: Number(remoteId) });

    // 2) wait for doctor to accept - server will emit 'call:accepted' to patient
    const onAccepted = ({ doctorId }) => {
      if (Number(doctorId) !== Number(remoteId)) return;
      socket.off("call:accepted", onAccepted);
      // doctor accepted -> proceed as caller
      startAsCaller();
    };

    const onCanceled = ({ from }) => {
      if (Number(from) === Number(remoteId)) {
        alert("Doctor canceled the call");
        cleanupAndNavigate();
      }
    };

    socket.on("call:accepted", onAccepted);
    socket.on("call:canceled", onCanceled);
  };

  const startAsCaller = async () => {
    setStatus("starting-call");
    const pc = createPeerConnection();
    try {
      // get local media & add tracks
      const stream = await getLocalStream();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      // send offer to doctor
      socket.emit("signal", { to: Number(remoteId), type: "offer", payload: pc.localDescription });
    } catch (err) {
      console.error("startAsCaller error:", err);
      alert("Unable to start media devices.");
      cleanupAndNavigate();
    }
  };

  const endCallClicked = async () => {
    // notify remote
    socket.emit("call:end", { to: Number(remoteId) });
    cleanupRtc();
    if (role === "doctor") {
      // open notes modal
      setShowNotesModal(true);
    } else {
      navigate("/dashboard/doctors");
    }
  };

  const cleanupRtc = () => {
    // stop tracks
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
    } catch (e) {}
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setStatus("ended");
  };

  const cleanupAndNavigate = () => {
    cleanupRtc();
    navigate("/dashboard/doctors");
  };

  const onNotesSaved = () => {
    setShowNotesModal(false);
    navigate("/dashboard/doctors");
  };

  // ---------- UI ----------
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Call</h2>

      {role === "patient" && status === "requesting" && (
        <div>
          <p>Requesting call with doctor... waiting for accept</p>
          <button
            onClick={() => {
              socket.emit("call:cancel", { to: Number(remoteId) });
              cleanupAndNavigate();
            }}
            className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
          >
            Cancel Request
          </button>
        </div>
      )}

      <div className="flex gap-4 items-start">
        <video ref={localVideoRef} autoPlay muted className="w-40 h-40 bg-black" />
        <video ref={remoteVideoRef} autoPlay className="w-72 h-72 bg-black" />
      </div>

      <div className="mt-4">
        {(status === "in-call" || status === "starting-call" || status === "waiting-for-offer") && (
          <button onClick={endCallClicked} className="bg-red-600 text-white px-4 py-2 rounded">
            End Call
          </button>
        )}
      </div>

      {/* Notes modal for doctor after call */}
      {showNotesModal && (
        <DoctorNotesModal
          patientUserId={callPartnerUserId}
          onClose={() => {
            setShowNotesModal(false);
            navigate("/dashboard/doctors");
          }}
          onSaved={onNotesSaved}
        />
      )}
    </div>
  );
}
