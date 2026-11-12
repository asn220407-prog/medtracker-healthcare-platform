
import pool from '../config/db.js';
import { broadcastPatientUpdate } from '../realtime.js';

export const addHealthTip = async (req, res) => {
  const { patient_id, tip_text } = req.body;
  const doctor_id = req.user.id;

  if (!patient_id || !tip_text || !tip_text.trim()) {
    return res.status(400).json({ msg: 'Patient ID and guidance text are required.' });
  }

  try {
    // IDOR / BOLA Prevention (PDF Checklist #2 & #11): Verify doctor-patient assignment
    const [assigned] = await pool.query(
      'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
      [doctor_id, patient_id]
    );
    if (assigned.length === 0) {
      return res.status(403).json({ msg: 'Not authorized: Patient is not assigned to you.' });
    }

    await pool.query(
      'INSERT INTO health_tips (patient_id, doctor_id, tip_text) VALUES (?, ?, ?)',
      [patient_id, doctor_id, tip_text.trim()]
    );
    broadcastPatientUpdate(patient_id, 'CLINICAL_UPDATED', { type: 'HEALTH_TIP_ADDED' });
    res.json({ msg: 'Health tip added successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error adding health tip' });
  }
};

export const updateHealthTip = async (req, res) => {
  const { tip_id } = req.params;
  const { tip_text } = req.body;

  if (!tip_text || !tip_text.trim()) {
    return res.status(400).json({ msg: 'Guidance text cannot be empty.' });
  }

  try {
    const [tipRows] = await pool.query('SELECT * FROM health_tips WHERE id = ?', [tip_id]);
    if (tipRows.length === 0) {
      return res.status(404).json({ msg: 'Health tip not found.' });
    }
    const tip = tipRows[0];

    // Check doctor authorization (must be uploader or assigned doctor)
    const [assigned] = await pool.query(
      'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
      [req.user.id, tip.patient_id]
    );
    if (assigned.length === 0 && tip.doctor_id !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to modify this health tip.' });
    }

    await pool.query(
      'UPDATE health_tips SET tip_text = ? WHERE id = ?',
      [tip_text.trim(), tip_id]
    );
    broadcastPatientUpdate(tip.patient_id, 'CLINICAL_UPDATED', { type: 'HEALTH_TIP_UPDATED' });
    res.json({ msg: 'Health tip updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error updating health tip' });
  }
};

export const deleteHealthTip = async (req, res) => {
  const { tip_id } = req.params;

  try {
    const [tipRows] = await pool.query('SELECT * FROM health_tips WHERE id = ?', [tip_id]);
    if (tipRows.length === 0) {
      return res.status(404).json({ msg: 'Health tip not found.' });
    }
    const tip = tipRows[0];

    // Check doctor authorization (must be uploader or assigned doctor)
    const [assigned] = await pool.query(
      'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
      [req.user.id, tip.patient_id]
    );
    if (assigned.length === 0 && tip.doctor_id !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this health tip.' });
    }

    await pool.query('DELETE FROM health_tips WHERE id = ?', [tip_id]);
    broadcastPatientUpdate(tip.patient_id, 'CLINICAL_UPDATED', { type: 'HEALTH_TIP_DELETED' });
    res.json({ msg: 'Health tip removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error deleting health tip' });
  }
};
