// Real-Time Server-Sent Events (SSE) Engine for MedTracker
// Powers instant, bi-directional-like synchronization between Doctors and Patients

import jwt from 'jsonwebtoken';
import pool from './config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Map of patient_id -> Set of active SSE response streams
const activeSubscribers = new Map();

export const initRealtimeStream = async (req, res) => {
  const patientId = req.query.patient_id;
  const token = req.query.token || req.headers['x-auth-token'];

  if (!patientId || !token) {
    return res.status(401).json({ msg: 'Missing patient_id or auth token for realtime stream' });
  }

  let user;
  try {
    user = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid realtime auth token' });
  }

  // Authorization check
  if (user.role === 'patient' && String(user.id) !== String(patientId)) {
    return res.status(403).json({ msg: 'Forbidden: Cannot subscribe to another patient\'s stream' });
  }

  if (user.role === 'doctor') {
    const [assigned] = await pool.query(
      'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
      [user.id, patientId]
    );
    if (assigned.length === 0) {
      return res.status(403).json({ msg: 'Forbidden: Patient not assigned to doctor' });
    }
  }

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const pIdStr = String(patientId);
  if (!activeSubscribers.has(pIdStr)) {
    activeSubscribers.set(pIdStr, new Set());
  }

  const clientStream = {
    res,
    userId: user.id,
    role: user.role,
  };

  activeSubscribers.get(pIdStr).add(clientStream);

  // Send initial connection handshake
  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', patientId, role: user.role, time: new Date().toISOString() })}\n\n`);

  // Heartbeat ping every 25 seconds to keep connection alive
  const pingInterval = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch (e) {
      clearInterval(pingInterval);
    }
  }, 25000);

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(pingInterval);
    const subs = activeSubscribers.get(pIdStr);
    if (subs) {
      subs.delete(clientStream);
      if (subs.size === 0) {
        activeSubscribers.delete(pIdStr);
      }
    }
  });
};

/**
 * Broadcast an event to all connected doctor and patient tabs viewing a patient's chart
 */
export const broadcastPatientUpdate = (patientId, eventType, data = {}) => {
  const pIdStr = String(patientId);
  const subs = activeSubscribers.get(pIdStr);
  if (!subs || subs.size === 0) return;

  const payload = JSON.stringify({
    type: eventType,
    patientId,
    timestamp: new Date().toISOString(),
    ...data,
  });

  for (const client of subs) {
    try {
      client.res.write(`event: message\ndata: ${payload}\n\n`);
    } catch (err) {
      console.error('Failed to write to SSE client:', err.message);
      subs.delete(client);
    }
  }
};
