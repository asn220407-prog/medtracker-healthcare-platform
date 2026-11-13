import pool from '../config/db.js';
import { broadcastPatientUpdate } from '../realtime.js';

export const getAdherence = async (req, res) => {
  const { medication_id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT DATE_FORMAT(taken_date, "%Y-%m-%d") as taken_date FROM medication_adherence WHERE medication_id = ? AND patient_id = ?',
      [medication_id, req.user.id]
    );
    const takenDates = rows.map(row => row.taken_date);
    res.json(takenDates);
  } catch (err) {
    console.error('Error in getAdherence:', err);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
};

export const tickCalendar = async (req, res) => {
  const { medication_id, date, patient_id } = req.body;

  try {
    let targetPatientId = req.user.id;

    // If a doctor is marking adherence, ensure the patient is assigned to this doctor
    if (req.user.role === 'doctor') {
      if (!patient_id) {
        return res.status(400).json({ msg: 'patient_id required when marking adherence as a doctor' });
      }
      const [assigned] = await pool.query(
        'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
        [req.user.id, patient_id]
      );
      if (assigned.length === 0) {
        return res.status(403).json({ msg: 'Not authorized: Patient is not assigned to you' });
      }
      targetPatientId = patient_id;
    }

    // Verify medication belongs to an appointment for this patient
    const [medRows] = await pool.query(
      `SELECT m.id, a.patient_id 
       FROM medications m 
       JOIN appointments a ON m.appointment_id = a.id 
       WHERE m.id = ? AND a.patient_id = ?`,
      [medication_id, targetPatientId]
    );

    if (medRows.length === 0) {
      return res.status(404).json({ msg: 'Medication prescription not found for this patient' });
    }

    // Insert with IGNORE to safely handle duplicate clicks without throwing 500
    await pool.query(
      'INSERT IGNORE INTO medication_adherence (medication_id, patient_id, taken_date) VALUES (?, ?, ?)',
      [medication_id, targetPatientId, date]
    );

    // Fetch updated taken dates for this medication
    const [allTaken] = await pool.query(
      'SELECT DATE_FORMAT(taken_date, "%Y-%m-%d") as taken_date FROM medication_adherence WHERE medication_id = ? AND patient_id = ?',
      [medication_id, targetPatientId]
    );
    const takenDates = allTaken.map(r => r.taken_date);

    // Broadcast Real-Time update to any active doctor and patient sessions
    broadcastPatientUpdate(targetPatientId, 'ADHERENCE_UPDATED', {
      medication_id: Number(medication_id),
      date,
      isTaken: true,
      takenDates,
      updatedBy: req.user.role,
    });

    res.json({
      msg: 'Date marked as taken',
      medication_id: Number(medication_id),
      date,
      isTaken: true,
      takenDates,
    });
  } catch (err) {
    console.error('Error in tickCalendar:', err);
    res.status(500).json({ msg: 'Server Error marking adherence' });
  }
};

export const untickCalendar = async (req, res) => {
  const { medication_id, date, patient_id } = req.body;

  try {
    let targetPatientId = req.user.id;

    if (req.user.role === 'doctor') {
      if (!patient_id) {
        return res.status(400).json({ msg: 'patient_id required when unmarking adherence as a doctor' });
      }
      const [assigned] = await pool.query(
        'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
        [req.user.id, patient_id]
      );
      if (assigned.length === 0) {
        return res.status(403).json({ msg: 'Not authorized: Patient is not assigned to you' });
      }
      targetPatientId = patient_id;
    }

    await pool.query(
      'DELETE FROM medication_adherence WHERE medication_id = ? AND patient_id = ? AND taken_date = ?',
      [medication_id, targetPatientId, date]
    );

    // Fetch updated taken dates for this medication
    const [allTaken] = await pool.query(
      'SELECT DATE_FORMAT(taken_date, "%Y-%m-%d") as taken_date FROM medication_adherence WHERE medication_id = ? AND patient_id = ?',
      [medication_id, targetPatientId]
    );
    const takenDates = allTaken.map(r => r.taken_date);

    // Broadcast Real-Time update to any active doctor and patient sessions
    broadcastPatientUpdate(targetPatientId, 'ADHERENCE_UPDATED', {
      medication_id: Number(medication_id),
      date,
      isTaken: false,
      takenDates,
      updatedBy: req.user.role,
    });

    res.json({
      msg: 'Date unmarked as taken',
      medication_id: Number(medication_id),
      date,
      isTaken: false,
      takenDates,
    });
  } catch (err) {
    console.error('Error in untickCalendar:', err);
    res.status(500).json({ msg: 'Server Error unmarking adherence' });
  }
};

export const getPatientAdherence = async (req, res) => {
  const { patient_id, medication_id } = req.params;

  try {
    // IDOR Check: Ensure requesting doctor is assigned to this patient
    const [assigned] = await pool.query(
      'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
      [req.user.id, patient_id]
    );
    if (assigned.length === 0) {
      return res.status(403).json({ msg: 'Not authorized: Patient is not assigned to you' });
    }

    const [rows] = await pool.query(
      'SELECT DATE_FORMAT(taken_date, "%Y-%m-%d") as taken_date FROM medication_adherence WHERE medication_id = ? AND patient_id = ?',
      [medication_id, patient_id]
    );
    const takenDates = rows.map(row => row.taken_date);
    res.json(takenDates);
  } catch (err) {
    console.error('Error in getPatientAdherence:', err);
    res.status(500).json({ msg: 'Server Error fetching patient adherence' });
  }
};
