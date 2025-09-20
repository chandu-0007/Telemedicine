const rawToken = localStorage.getItem("token"); // keep "Bearer <JWT>"
const socket = io("http://localhost:4000", {
  auth: { token: rawToken },
  transports: ["websocket"],
});