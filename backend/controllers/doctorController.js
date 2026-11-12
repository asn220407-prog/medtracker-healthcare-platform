
import pool from '../config/db.js';
import { broadcastPatientUpdate } from '../realtime.js';

export const getDashboard = async (req, res) => {
  try {
    const [doctorProfile] = await pool.query('SELECT * FROM doctor_profiles WHERE user_id = ?', [req.user.id]);
    const [patients] = await pool.query(
      `SELECT p.user_id, p.full_name, p.sex, p.age, p.weight, MAX(a.appointment_date) AS appointment_date 
       FROM patient_profiles p 
       JOIN doctor_patient_map dpm ON p.user_id = dpm.patient_id 
       LEFT JOIN appointments a ON p.user_id = a.patient_id 
       WHERE dpm.doctor_id = ? 
       GROUP BY p.user_id, p.full_name, p.sex, p.age, p.weight 
       ORDER BY appointment_date DESC`,
      [req.user.id]
    );

    res.json({
      doctorProfile: doctorProfile[0],
      patients,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
};

export const updatePatient = async (req, res) => {
  const { patient_id } = req.params;
  const { fullName, sex, age, weight } = req.body;

  if (age < 0 || weight < 0) {
    return res.status(400).json({ msg: 'Age and weight cannot be negative.' });
  }

  try {
    // IDOR / BOLA Prevention: Verify doctor-patient assignment
    const [assigned] = await pool.query(
      'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
      [req.user.id, patient_id]
    );
    if (assigned.length === 0) {
      return res.status(403).json({ msg: 'Not authorized: Patient is not assigned to you.' });
    }

    await pool.query(
      'UPDATE patient_profiles SET full_name = ?, sex = ?, age = ?, weight = ? WHERE user_id = ?',
      [fullName, sex, age, weight, patient_id]
    );

    broadcastPatientUpdate(patient_id, 'CLINICAL_UPDATED', { type: 'PROFILE_UPDATED' });

    res.json({ msg: 'Patient updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error updating patient' });
  }
};

export const deletePatient = async (req, res) => {
  const { patient_id } = req.params;

  try {
    // IDOR / BOLA Prevention (PDF Checklist #2 & #11): Verify doctor-patient assignment
    const [assigned] = await pool.query(
      'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
      [req.user.id, patient_id]
    );
    if (assigned.length === 0) {
      return res.status(403).json({ msg: 'Not authorized: Patient is not assigned to you.' });
    }

    // First, remove from doctor_patient_map
    await pool.query('DELETE FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?', [req.user.id, patient_id]);
    
    // Check if patient has any remaining assigned doctors before deleting user entirely
    const [remainingDocs] = await pool.query(
      'SELECT id FROM doctor_patient_map WHERE patient_id = ?',
      [patient_id]
    );
    if (remainingDocs.length === 0) {
      await pool.query('DELETE FROM users WHERE id = ?', [patient_id]);
    }

    broadcastPatientUpdate(patient_id, 'CLINICAL_UPDATED', { type: 'PATIENT_REMOVED' });

    res.json({ msg: 'Patient removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error removing patient' });
  }
};

export const addAppointment = async (req, res) => {
  const { patient_id, appointment_date, present_complaint, final_diagnosis } = req.body;
  const doctor_id = req.user.id;

  if (!patient_id || !appointment_date) {
    return res.status(400).json({ msg: 'Patient ID and appointment date are required.' });
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

    const [result] = await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, present_complaint, final_diagnosis) VALUES (?, ?, ?, ?, ?)',
      [patient_id, doctor_id, appointment_date, present_complaint || '', final_diagnosis || '']
    );

    broadcastPatientUpdate(patient_id, 'CLINICAL_UPDATED', { type: 'APPOINTMENT_ADDED' });

    res.json({ id: result.insertId, msg: 'Appointment logged successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error adding appointment' });
  }
};
