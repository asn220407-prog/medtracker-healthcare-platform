
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const protect = async (req, res, next) => {
  let token;

  // Header tokens (Bearer or x-auth-token) take precedence over ambient cookies
  if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.medtracker_token) {
    token = req.cookies.medtracker_token;
  }

  if (!token) {
    return res.status(401).json({ msg: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.query('SELECT id, email, role FROM users WHERE id = ?', [decoded.id]);
    req.user = rows[0];
    next();
  } catch (error) {
    console.warn(`[AuthMiddleware] Token verification failed: ${error.message}`);
    res.status(401).json({ msg: 'Not authorized, token failed' });
  }
};

export const isDoctor = (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    next();
  } else {
    res.status(401).json({ msg: 'Not authorized as a doctor' });
  }
};

export const isPatient = (req, res, next) => {
  if (req.user && req.user.role === 'patient') {
    next();
  } else {
    res.status(401).json({ msg: 'Not authorized as a patient' });
  }
};
