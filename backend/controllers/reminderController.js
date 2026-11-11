import pool from '../config/db.js';

export const createReminder = async (req, res) => {
  try {
    let { patient_id, medication_id, reminder_time, reminder_message } = req.body;
    const user_id = req.user.id;
    const user_role = req.user.role;

    if (!reminder_time) {
      return res.status(400).json({ msg: 'Reminder time is required.' });
    }

    // Role-specific patient_id assignment & validation
    if (user_role === 'patient') {
      patient_id = user_id;
    } else if (user_role === 'doctor') {
      if (!patient_id) {
        return res.status(400).json({ msg: 'Patient ID is required when setting a reminder as a doctor.' });
      }
      // Check doctor assignment
      const [assigned] = await pool.query(
        'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
        [user_id, patient_id]
      );
      if (assigned.length === 0) {
        return res.status(403).json({ msg: 'Not authorized: Patient is not assigned to you.' });
      }
    }

    // Optional medication validation
    let medId = medication_id ? parseInt(medication_id) : null;
    let defaultMessage = reminder_message;

    if (medId) {
      const [medRows] = await pool.query('SELECT name, dosage FROM medications WHERE id = ?', [medId]);
      if (medRows.length > 0 && !defaultMessage) {
        defaultMessage = `Time to take ${medRows[0].name} (${medRows[0].dosage || ''})`;
      }
    }

    if (!defaultMessage) {
      defaultMessage = 'Medication Reminder';
    }

    // Normalize time to HH:MM:00
    let formattedTime = reminder_time;
    if (formattedTime.length === 5) {
      formattedTime += ':00';
    }

    const [result] = await pool.query(
      `INSERT INTO reminders (user_id, patient_id, medication_id, reminder_time, reminder_message, is_active)
       VALUES (?, ?, ?, ?, ?, true)`,
      [user_id, patient_id, medId, formattedTime, defaultMessage]
    );

    res.status(201).json({
      msg: 'Reminder set successfully',
      reminder: {
        id: result.insertId,
        user_id,
        patient_id: parseInt(patient_id),
        medication_id: medId,
        reminder_time: formattedTime.slice(0, 5),
        reminder_message: defaultMessage,
        is_active: true,
      },
    });
  } catch (err) {
    console.error('Error creating reminder:', err.message);
    res.status(500).json({ msg: 'Server error while creating reminder' });
  }
};

export const getReminders = async (req, res) => {
  try {
    const user_id = req.user.id;
    const user_role = req.user.role;
    let targetPatientId = req.query.patient_id;

    if (user_role === 'patient') {
      targetPatientId = user_id;
    } else if (user_role === 'doctor') {
      if (targetPatientId) {
        const [assigned] = await pool.query(
          'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
          [user_id, targetPatientId]
        );
        if (assigned.length === 0) {
          return res.status(403).json({ msg: 'Not authorized to view reminders for this patient.' });
        }
      }
    }

    let query = `
      SELECT r.id, r.user_id, r.patient_id, r.medication_id,
             TIME_FORMAT(r.reminder_time, '%H:%i') as reminder_time,
             r.reminder_message, r.is_active, r.created_at,
             m.name as medication_name, m.dosage as medication_dosage,
             u.role as creator_role,
             COALESCE(dp.full_name, pp.full_name, 'User') as creator_name
      FROM reminders r
      LEFT JOIN medications m ON r.medication_id = m.id
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN doctor_profiles dp ON u.id = dp.user_id
      LEFT JOIN patient_profiles pp ON u.id = pp.user_id
    `;
    const params = [];

    if (targetPatientId) {
      query += ' WHERE r.patient_id = ?';
      params.push(targetPatientId);
      if (req.query.medication_id) {
        query += ' AND r.medication_id = ?';
        params.push(req.query.medication_id);
      }
    } else if (user_role === 'doctor') {
      query += ' WHERE r.user_id = ?';
      params.push(user_id);
    }

    query += ' ORDER BY r.reminder_time ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching reminders:', err.message);
    res.status(500).json({ msg: 'Server error while fetching reminders' });
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;

    const [existing] = await pool.query('SELECT * FROM reminders WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ msg: 'Reminder not found.' });
    }

    const reminder = existing[0];

    // Authorization check
    if (user_role === 'patient' && reminder.patient_id !== user_id) {
      return res.status(403).json({ msg: 'Not authorized to delete this reminder.' });
    }

    if (user_role === 'doctor') {
      const [assigned] = await pool.query(
        'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
        [user_id, reminder.patient_id]
      );
      if (reminder.user_id !== user_id && assigned.length === 0) {
        return res.status(403).json({ msg: 'Not authorized to delete this reminder.' });
      }
    }

    await pool.query('DELETE FROM reminders WHERE id = ?', [id]);
    res.json({ msg: 'Reminder removed successfully' });
  } catch (err) {
    console.error('Error deleting reminder:', err.message);
    res.status(500).json({ msg: 'Server error while deleting reminder' });
  }
};

export const toggleReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;

    const [existing] = await pool.query('SELECT * FROM reminders WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ msg: 'Reminder not found.' });
    }

    const reminder = existing[0];

    // Authorization check
    if (user_role === 'patient' && reminder.patient_id !== user_id) {
      return res.status(403).json({ msg: 'Not authorized to modify this reminder.' });
    }

    if (user_role === 'doctor') {
      const [assigned] = await pool.query(
        'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
        [user_id, reminder.patient_id]
      );
      if (reminder.user_id !== user_id && assigned.length === 0) {
        return res.status(403).json({ msg: 'Not authorized to modify this reminder.' });
      }
    }

    const newStatus = !reminder.is_active;
    await pool.query('UPDATE reminders SET is_active = ? WHERE id = ?', [newStatus, id]);

    res.json({ msg: 'Reminder status updated', is_active: newStatus });
  } catch (err) {
    console.error('Error toggling reminder:', err.message);
    res.status(500).json({ msg: 'Server error while toggling reminder' });
  }
};
