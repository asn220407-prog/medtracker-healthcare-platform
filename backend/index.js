import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import doctorRoutes from './routes/doctor.js';
import patientRoutes from './routes/patient.js';
import medicationRoutes from './routes/medication.js';
import healthTipRoutes from './routes/healthTip.js';
import adherenceRoutes from './routes/adherence.js';
import reminderRoutes from './routes/reminder.js';
import chatRoutes from './routes/chat.js';
import { initRealtimeStream } from './realtime.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Security & CORS Middleware
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(cors({
  origin: true, // Reflect request origin, perfectly compatible with local dev and production
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

// Serve uploaded static assets (lab report PDFs & images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { dotfiles: 'ignore' }));

// Core Application API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/health-tips', healthTipRoutes);
app.use('/api/adherence', adherenceRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/chat', chatRoutes);
app.get('/api/realtime/stream', initRealtimeStream);

// Health / Status Check
app.get('/', (req, res) => {
  res.send('MedTracker API is running...');
});

// Centralized 404 Handler
app.use((req, res) => {
  res.status(404).json({ msg: 'Requested resource not found' });
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Application Error]:', err.message);
  res.status(err.status || 500).json({
    msg: err.message || 'Internal Server Error',
  });
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port} (0.0.0.0)`);
});
server.on('error', (err) => {
  console.error('[Server Listen Error]:', err);
});

export { app, server };
export default app;
