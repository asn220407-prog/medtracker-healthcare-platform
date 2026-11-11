
import pool from '../config/db.js';
import { broadcastPatientUpdate } from '../realtime.js';

export const addMedication = async (req, res) => {
  const { patient_id, name, dosage, start_date, end_date } = req.body;
  const doctor_id = req.user.id;

  if (!patient_id || !name || !start_date || !end_date) {
    return res.status(400).json({ msg: 'Patient ID, medication name, start date, and end date are required.' });
  }

  if (new Date(end_date) < new Date(start_date)) {
    return res.status(400).json({ msg: 'End date cannot be earlier than start date.' });
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

    let appointment_id;
    // Check for an existing appointment with this doctor or create one
    const [appointments] = await pool.query(
      'SELECT id FROM appointments WHERE patient_id = ? AND doctor_id = ? ORDER BY appointment_date DESC LIMIT 1',
      [patient_id, doctor_id]
    );

    if (appointments.length > 0) {
      appointment_id = appointments[0].id;
    } else {
      // If no appointment, create a default consultation appointment
      const [newAppointment] = await pool.query(
        'INSERT INTO appointments (patient_id, doctor_id, appointment_date, present_complaint, final_diagnosis) VALUES (?, ?, NOW(), ?, ?)',
        [patient_id, doctor_id, 'Prescription consultation', 'Regimen prescribed']
      );
      appointment_id = newAppointment.insertId;
    }

    const [newMedication] = await pool.query(
      'INSERT INTO medications (appointment_id, name, dosage, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      [appointment_id, name, dosage, start_date, end_date]
    );

    broadcastPatientUpdate(patient_id, 'CLINICAL_UPDATED', { type: 'MEDICATION_ADDED' });

    res.json({ id: newMedication.insertId, msg: 'Medication added successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error adding medication' });
  }
};

export const updateMedication = async (req, res) => {
  const { medication_id } = req.params;
  const { name, dosage, start_date, end_date } = req.body;

  if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
    return res.status(400).json({ msg: 'End date cannot be earlier than start date.' });
  }

  try {
    // IDOR Check: Ensure medication exists and doctor is authorized
    const [medRows] = await pool.query(
      `SELECT m.id, a.patient_id, a.doctor_id 
       FROM medications m 
       JOIN appointments a ON m.appointment_id = a.id 
       WHERE m.id = ?`,
      [medication_id]
    );

    if (medRows.length === 0) {
      return res.status(404).json({ msg: 'Medication not found.' });
    }

    const med = medRows[0];
    const [assigned] = await pool.query(
      'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
      [req.user.id, med.patient_id]
    );

    if (assigned.length === 0 && med.doctor_id !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized: Patient is not assigned to you.' });
    }

    await pool.query(
      'UPDATE medications SET name = ?, dosage = ?, start_date = ?, end_date = ? WHERE id = ?',
      [name, dosage, start_date, end_date, medication_id]
    );

    broadcastPatientUpdate(med.patient_id, 'CLINICAL_UPDATED', { type: 'MEDICATION_UPDATED' });

    res.json({ msg: 'Medication updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error updating medication' });
  }
};

export const deleteMedication = async (req, res) => {
  const { medication_id } = req.params;

  try {
    // IDOR Check: Ensure medication exists and doctor is authorized
    const [medRows] = await pool.query(
      `SELECT m.id, a.patient_id, a.doctor_id 
       FROM medications m 
       JOIN appointments a ON m.appointment_id = a.id 
       WHERE m.id = ?`,
      [medication_id]
    );

    if (medRows.length === 0) {
      return res.status(404).json({ msg: 'Medication not found.' });
    }

    const med = medRows[0];
    const [assigned] = await pool.query(
      'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
      [req.user.id, med.patient_id]
    );

    if (assigned.length === 0 && med.doctor_id !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this medication.' });
    }

    await pool.query('DELETE FROM medications WHERE id = ?', [medication_id]);

    broadcastPatientUpdate(med.patient_id, 'CLINICAL_UPDATED', { type: 'MEDICATION_DELETED' });

    res.json({ msg: 'Medication removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error deleting medication' });
  }
};
