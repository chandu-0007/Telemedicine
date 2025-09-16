"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const users_1 = __importDefault(require("./routes/users"));
const appointments_1 = __importDefault(require("./routes/appointments"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use((0, cors_1.default)());
// Middleware
app.use(express_1.default.json());
// Health check
app.get('/', (req, res) => {
    res.send('API is running ✅');
});
// Routes
app.use('/users', users_1.default);
app.use('/appointments', appointments_1.default);
// 404 Not Found
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Global error handler (optional)
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
app.listen(port, () => {
    console.log("🚀 Server running at http://localhost:" + port);
});
