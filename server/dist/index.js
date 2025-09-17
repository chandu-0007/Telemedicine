"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const users_1 = __importDefault(require("./routes/users"));
const appointments_1 = __importDefault(require("./routes/appointments"));
const socketHandlers_1 = require("./socketHandlers");
const client_1 = require("@prisma/client");
const doctors_1 = __importDefault(require("./routes/doctors"));
const consultations_1 = __importDefault(require("./routes/consultations"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check
app.get('/', (req, res) => {
    res.send('API is running ✅');
});
// Routes
app.use('/users', users_1.default);
app.use('/consultations', consultations_1.default);
app.use('/appointments', appointments_1.default);
app.use("/doctors", doctors_1.default);
// 404 Not Found
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Global error handler (optional)
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// Create HTTP server instead of app.listen
const server = http_1.default.createServer(app);
// Attach Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173", // your React dev server
        methods: ["GET", "POST"],
    },
});
// Register signaling logic
(0, socketHandlers_1.registerSocketHandlers)(io);
// Start server
server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
