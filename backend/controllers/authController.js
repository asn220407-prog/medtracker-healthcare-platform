
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const register = async (req, res) => {
  const { email, password, role, fullName, qualification, sex, age, weight, doctor_id, contact_details } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const [existingUsers] = await pool.query('SELECT id, password, role FROM users WHERE email = ?', [email]);

    let userId;
    let userRole;

    if (existingUsers.length > 0) {
      // User with this email already exists
      const existingUser = existingUsers[0];

      if (existingUser.role !== 'patient') {
        return res.status(400).json({ msg: 'User with this email is not a patient.' });
      }

      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials for existing patient.' });
      }

      userId = existingUser.id;
      userRole = existingUser.role;

      // Check if patient is already assigned to this doctor
      if (doctor_id) {
        const [existingMap] = await pool.query(
          'SELECT * FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
          [doctor_id, userId]
        );
        if (existingMap.length > 0) {
          return res.status(400).json({ msg: 'Patient already assigned to this doctor.' });
        }
        await pool.query(
          'INSERT INTO doctor_patient_map (doctor_id, patient_id) VALUES (?, ?)',
          [doctor_id, userId]
        );
      }
      // If an existing patient is being assigned, we don't create a new profile or user.
      // We just link them to the doctor.
    } else {
      // User does not exist, create a new one
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const [newUser] = await pool.query(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [email, hashedPassword, role]
      );

      userId = newUser.insertId;
      userRole = role;

      if (role === 'doctor') {
        await pool.query(
          'INSERT INTO doctor_profiles (user_id, full_name, qualification, contact_details) VALUES (?, ?, ?, ?)',
          [userId, fullName, qualification, contact_details]
        );
      } else {
        const parsedAge = age !== undefined && age !== '' && !isNaN(parseInt(age, 10)) ? parseInt(age, 10) : 30;
        const parsedWeight = weight !== undefined && weight !== '' && !isNaN(parseFloat(weight)) ? parseFloat(weight) : 70;
        const patientSex = sex || 'Male';

        await pool.query(
          'INSERT INTO patient_profiles (user_id, full_name, sex, age, weight) VALUES (?, ?, ?, ?, ?)',
          [userId, fullName, patientSex, parsedAge, parsedWeight]
        );
        if (doctor_id) {
          await pool.query(
            'INSERT INTO doctor_patient_map (doctor_id, patient_id) VALUES (?, ?)',
            [doctor_id, userId]
          );
        } else {
          // Auto-assign to default attending physician so patient appears in the doctor roster
          const [docs] = await pool.query('SELECT user_id FROM doctor_profiles LIMIT 1');
          if (docs.length > 0) {
            await pool.query(
              'INSERT INTO doctor_patient_map (doctor_id, patient_id) VALUES (?, ?)',
              [docs[0].user_id, userId]
            );
          }
        }
      }
    }

    const token = jwt.sign({ id: userId, role: userRole }, JWT_SECRET, {
      expiresIn: 3600
    });

    // HttpOnly Secure Cookie (Dual-Transport)
    res.cookie('medtracker_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 * 1000,
    });

    res.json({
      token,
      user: {
        id: userId,
        email,
        role: userRole
      }
    });
  } catch (err) {
    console.error('[Registration Error]:', err.message);
    res.status(500).json({ msg: err.message || 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);
    if (rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: 3600
    });

    // HttpOnly Secure Cookie (Dual-Transport)
    res.cookie('medtracker_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 * 1000,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('[Registration Error]:', err.message);
    res.status(500).json({ msg: err.message || 'Server error during registration' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('medtracker_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ msg: 'Logged out successfully' });
};
