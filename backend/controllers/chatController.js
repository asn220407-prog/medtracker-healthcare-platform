import pool from '../config/db.js';
import { broadcastPatientUpdate } from '../realtime.js';

export const getMessages = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const user = req.user;

    // RBAC & IDOR Authorization Check
    if (user.role === 'patient' && String(user.id) !== String(patient_id)) {
      return res.status(403).json({ msg: 'Forbidden: You can only view your own messages.' });
    }

    if (user.role === 'doctor') {
      const [assigned] = await pool.query(
        'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
        [user.id, patient_id]
      );
      if (assigned.length === 0) {
        return res.status(403).json({ msg: 'Forbidden: You are not assigned to this patient.' });
      }
    }

    const [messages] = await pool.query(
      `SELECT id, patient_id, sender_id, sender_role, sender_name, message_text, created_at
       FROM messages
       WHERE patient_id = ?
       ORDER BY created_at ASC`,
      [patient_id]
    );

    res.json(messages);
  } catch (err) {
    console.error('Error fetching chat messages:', err.message);
    res.status(500).json({ msg: 'Server error while fetching messages' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const patient_id = req.params.patient_id || req.body.patient_id;
    const { message_text } = req.body;
    const user = req.user;

    if (!message_text || !message_text.trim()) {
      return res.status(400).json({ msg: 'Message text cannot be empty.' });
    }

    const cleanText = message_text.trim();
    if (cleanText.length > 2000) {
      return res.status(400).json({ msg: 'Message length cannot exceed 2000 characters.' });
    }

    // RBAC & IDOR Authorization Check
    if (user.role === 'patient' && String(user.id) !== String(patient_id)) {
      return res.status(403).json({ msg: 'Forbidden: You can only send messages from your own patient account.' });
    }

    let senderName = user.role === 'doctor' ? 'Doctor' : 'Patient';

    if (user.role === 'doctor') {
      const [assigned] = await pool.query(
        'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
        [user.id, patient_id]
      );
      if (assigned.length === 0) {
        return res.status(403).json({ msg: 'Forbidden: You are not assigned to this patient.' });
      }
      const [docProfile] = await pool.query(
        'SELECT full_name FROM doctor_profiles WHERE user_id = ?',
        [user.id]
      );
      if (docProfile.length > 0 && docProfile[0].full_name) {
        senderName = `Dr. ${docProfile[0].full_name.replace(/^Dr\.\s*/i, '')}`;
      }
    } else {
      const [ptProfile] = await pool.query(
        'SELECT full_name FROM patient_profiles WHERE user_id = ?',
        [user.id]
      );
      if (ptProfile.length > 0 && ptProfile[0].full_name) {
        senderName = ptProfile[0].full_name;
      }
    }

    const [result] = await pool.query(
      `INSERT INTO messages (patient_id, sender_id, sender_role, sender_name, message_text)
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, user.id, user.role, senderName, cleanText]
    );

    const newMessage = {
      id: result.insertId,
      patient_id: parseInt(patient_id),
      sender_id: user.id,
      sender_role: user.role,
      sender_name: senderName,
      message_text: cleanText,
      created_at: new Date().toISOString()
    };

    // Broadcast in real-time over SSE stream to both doctor and patient
    broadcastPatientUpdate(patient_id, 'CHAT_MESSAGE_RECEIVED', { message: newMessage });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error sending chat message:', err.message);
    res.status(500).json({ msg: 'Server error while sending message' });
  }
};
