// src/socket.js
import { io } from "socket.io-client";

const rawToken = localStorage.getItem("token"); // "Bearer <JWT>"
const token = rawToken?.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;

const socket = io("http://localhost:4000", {
  auth: { token },        // <-- raw JWT
  transports: ["websocket"], // optional, force websocket
});

export default socket;
