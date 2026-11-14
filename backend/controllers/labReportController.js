import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import { broadcastPatientUpdate } from '../realtime.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadReport = async (req, res) => {
  try {
    const { patient_id } = req.body;
    const doctor_id = req.user.id;

    if (!req.file) {
      return res.status(400).json({ msg: 'Please select a lab report file to upload.' });
    }

    if (!patient_id) {
      // Clean up uploaded file if missing patient_id
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ msg: 'Patient ID is required.' });
    }

    // RBAC Check: Ensure doctor is assigned to this patient
    const [assigned] = await pool.query(
      'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
      [doctor_id, patient_id]
    );

    if (assigned.length === 0) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(403).json({ msg: 'Not authorized: Patient is not assigned to you.' });
    }

    const fileName = req.file.originalname;
    const filePath = `/uploads/lab_reports/${req.file.filename}`;

    const [result] = await pool.query(
      'INSERT INTO lab_reports (patient_id, doctor_id, file_name, file_path) VALUES (?, ?, ?, ?)',
      [patient_id, doctor_id, fileName, filePath]
    );

    const uploadedReport = {
      id: result.insertId,
      patient_id: parseInt(patient_id),
      doctor_id,
      file_name: fileName,
      file_path: filePath,
      upload_date: new Date(),
    };

    // Broadcast instant update so patient's view updates immediately
    broadcastPatientUpdate(patient_id, 'CLINICAL_UPDATED', {
      type: 'LAB_REPORT_ADDED',
      report: uploadedReport,
    });

    res.status(201).json({
      msg: 'Lab report uploaded successfully',
      report: uploadedReport,
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error uploading lab report:', err.message);
    res.status(500).json({ msg: 'Server error while uploading lab report' });
  }
};

export const getLabReports = async (req, res) => {
  try {
    const { patient_id } = req.params;

    // RBAC Security Check
    if (req.user.role === 'patient' && String(req.user.id) !== String(patient_id)) {
      return res.status(403).json({ msg: 'Not authorized: Patients can only view their own lab reports.' });
    }

    if (req.user.role === 'doctor') {
      const [assigned] = await pool.query(
        'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
        [req.user.id, patient_id]
      );
      if (assigned.length === 0) {
        return res.status(403).json({ msg: 'Not authorized: Patient is not assigned to you.' });
      }
    }

    const [reports] = await pool.query(
      `SELECT lr.id, lr.patient_id, lr.doctor_id, lr.file_name, lr.file_path, lr.upload_date,
              COALESCE(dp.full_name, 'Doctor') as doctor_name
       FROM lab_reports lr
       LEFT JOIN doctor_profiles dp ON lr.doctor_id = dp.user_id
       WHERE lr.patient_id = ?
       ORDER BY lr.upload_date DESC`,
      [patient_id]
    );

    res.json(reports);
  } catch (err) {
    console.error('Error fetching lab reports:', err.message);
    res.status(500).json({ msg: 'Server error while fetching lab reports' });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor_id = req.user.id;

    const [existing] = await pool.query('SELECT * FROM lab_reports WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ msg: 'Lab report not found.' });
    }

    const report = existing[0];

    // Verify doctor permission (must be uploader or assigned to the patient)
    const [assigned] = await pool.query(
      'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
      [doctor_id, report.patient_id]
    );

    if (report.doctor_id !== doctor_id && assigned.length === 0) {
      return res.status(403).json({ msg: 'Not authorized to delete this lab report.' });
    }

    // Delete record from DB
    await pool.query('DELETE FROM lab_reports WHERE id = ?', [id]);

    // Broadcast update to patient session
    broadcastPatientUpdate(report.patient_id, 'CLINICAL_UPDATED', {
      type: 'LAB_REPORT_DELETED',
      reportId: Number(id),
    });

    // Delete physical file from disk
    const diskPath = path.join(__dirname, '..', report.file_path);
    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
    }

    res.json({ msg: 'Lab report deleted successfully' });
  } catch (err) {
    console.error('Error deleting lab report:', err.message);
    res.status(500).json({ msg: 'Server error while deleting lab report' });
  }
};
