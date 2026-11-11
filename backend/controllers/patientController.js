import pool from '../config/db.js';

export const getVitalTrackerData = async (req, res) => {
  const { patient_id } = req.params;

  // RBAC Security Check:
  // 1. Patients can strictly only view their own vital tracker records
  if (req.user.role === 'patient' && String(req.user.id) !== String(patient_id)) {
    return res.status(403).json({ msg: 'Not authorized to view other patient records' });
  }

  // 2. Doctors can only view patients assigned to them
  if (req.user.role === 'doctor') {
    const [assigned] = await pool.query(
      'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
      [req.user.id, patient_id]
    );
    if (assigned.length === 0) {
      return res.status(403).json({ msg: 'Not authorized: Patient is not assigned to you' });
    }
  }

  try {
    const [patientProfile] = await pool.query('SELECT * FROM patient_profiles WHERE user_id = ?', [patient_id]);
    if (patientProfile.length === 0) {
      return res.status(404).json({ msg: 'Patient profile not found' });
    }

    const [appointments] = await pool.query(
      `SELECT a.*, dp.full_name as doctor_name, dp.qualification as doctor_specialization
       FROM appointments a
       LEFT JOIN doctor_profiles dp ON a.doctor_id = dp.user_id
       WHERE a.patient_id = ? 
       ORDER BY a.appointment_date DESC LIMIT 10`,
      [patient_id]
    );

    const appointmentIds = appointments.map(a => a.id);

    let medications = [];
    if (appointmentIds.length > 0) {
      const [meds] = await pool.query(
        `SELECT 
           m.*, 
           a.doctor_id, 
           dp.full_name as doctor_name, 
           dp.qualification as doctor_specialization,
           u.email as doctor_email
         FROM medications m
         JOIN appointments a ON m.appointment_id = a.id
         LEFT JOIN doctor_profiles dp ON a.doctor_id = dp.user_id
         LEFT JOIN users u ON a.doctor_id = u.id
         WHERE m.appointment_id IN (?)`,
        [appointmentIds]
      );
      medications = meds;
    }

    const [healthTips] = await pool.query('SELECT * FROM health_tips WHERE patient_id = ? ORDER BY id DESC LIMIT 10', [patient_id]);

    // Query ALL assigned doctors for this patient (supports multi-doctor care teams)
    const [assignedDoctors] = await pool.query(
      `SELECT 
         dp.user_id as doctor_id, 
         dp.full_name, 
         dp.qualification, 
         dp.contact_details as contact_details,
         dp.contact_details as Contact, 
         u.email 
       FROM doctor_patient_map dpm
       JOIN doctor_profiles dp ON dpm.doctor_id = dp.user_id
       JOIN users u ON dp.user_id = u.id
       WHERE dpm.patient_id = ?`,
      [patient_id]
    );

    // Single-Query Adherence
    const [adherenceRows] = await pool.query(
      'SELECT medication_id, DATE_FORMAT(taken_date, "%Y-%m-%d") as taken_date FROM medication_adherence WHERE patient_id = ?',
      [patient_id]
    );

    const adherenceByMedication = {};
    for (const row of adherenceRows) {
      if (!adherenceByMedication[row.medication_id]) {
        adherenceByMedication[row.medication_id] = [];
      }
      adherenceByMedication[row.medication_id].push(row.taken_date);
    }

    res.json({
      patientProfile: patientProfile[0],
      appointments,
      medications,
      healthTips,
      doctorProfile: assignedDoctors[0] || null, // legacy compatibility
      assignedDoctors: assignedDoctors || [], // Multi-doctor array
      adherence: adherenceByMedication,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error fetching vital data' });
  }
};

export const getProgressData = async (req, res) => {
  const { patient_id } = req.params;

  // RBAC check: Patient can only view their own progress, Doctor can only view their assigned patients
  if (req.user.role === 'patient' && String(req.user.id) !== String(patient_id)) {
    return res.status(403).json({ msg: 'Not authorized to view another patient\'s progress' });
  }

  if (req.user.role === 'doctor') {
    const [assigned] = await pool.query(
      'SELECT id FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
      [req.user.id, patient_id]
    );
    if (assigned.length === 0) {
      return res.status(403).json({ msg: 'Not authorized: Patient is not assigned to you' });
    }
  }

  try {
    const [appointments] = await pool.query(
      'SELECT id FROM appointments WHERE patient_id = ?',
      [patient_id]
    );

    const appointmentIds = appointments.map(a => a.id);
    let medications = [];
    if (appointmentIds.length > 0) {
      const [meds] = await pool.query(
        `SELECT m.*, a.doctor_id, dp.full_name as doctor_name, dp.qualification as doctor_specialization
         FROM medications m
         JOIN appointments a ON m.appointment_id = a.id
         LEFT JOIN doctor_profiles dp ON a.doctor_id = dp.user_id
         WHERE m.appointment_id IN (?)`,
        [appointmentIds]
      );
      medications = meds;
    }

    const [adherenceRows] = await pool.query(
      'SELECT medication_id, DATE_FORMAT(taken_date, "%Y-%m-%d") as taken_date FROM medication_adherence WHERE patient_id = ?',
      [patient_id]
    );

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const medicationProgress = medications.map(med => {
      const s = new Date(med.start_date);
      const startDate = new Date(s.getFullYear(), s.getMonth(), s.getDate());
      const e = new Date(med.end_date);
      const endDate = new Date(e.getFullYear(), e.getMonth(), e.getDate());

      const totalPrescribedDays = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);

      let prescribedDaysPassed = 0;
      if (today >= startDate) {
        const effectiveEnd = today < endDate ? today : endDate;
        prescribedDaysPassed = Math.max(1, Math.round((effectiveEnd - startDate) / (1000 * 60 * 60 * 24)) + 1);
      }

      const medTakenRows = adherenceRows.filter(row => row.medication_id === med.id);
      const totalTaken = medTakenRows.length;

      // Calculate adherence percentage against the full prescribed treatment duration
      const adherencePercentage = Math.min(100, Math.round((totalTaken / totalPrescribedDays) * 100));

      return {
        medication_id: med.id,
        name: med.name,
        dosage: med.dosage,
        doctor_name: med.doctor_name || 'Assigned Physician',
        doctor_specialization: med.doctor_specialization || 'Clinical Specialist',
        totalPrescribedDays,
        prescribedDaysPassed,
        totalTaken,
        adherencePercentage,
      };
    });

    const generateChartData = (daysCount) => {
      const labels = [];
      const takenData = [];
      const missedData = [];

      for (let i = daysCount - 1; i >= 0; i--) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - i);
        const yyyy = targetDate.getFullYear();
        const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
        const dd = String(targetDate.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const label = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        labels.push(label);

        const activeMeds = medications.filter(med => {
          const s = new Date(med.start_date);
          const medStart = new Date(s.getFullYear(), s.getMonth(), s.getDate());
          const e = new Date(med.end_date);
          const medEnd = new Date(e.getFullYear(), e.getMonth(), e.getDate());
          return targetDate >= medStart && targetDate <= medEnd;
        });

        const dateTakenRows = adherenceRows.filter(row => row.taken_date === dateStr);
        let takenCount = dateTakenRows.length;
        let missedCount = 0;

        for (const med of activeMeds) {
          const isTaken = dateTakenRows.some(row => row.medication_id === med.id);
          if (!isTaken && targetDate <= today) {
            missedCount++;
          }
        }

        takenData.push(takenCount);
        missedData.push(missedCount);
      }

      return {
        labels,
        datasets: [
          {
            label: 'Doses Taken',
            data: takenData,
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: '#10b981',
            borderWidth: 2,
            borderRadius: 4,
          },
          {
            label: 'Doses Missed',
            data: missedData,
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderColor: '#ef4444',
            borderWidth: 2,
            borderRadius: 4,
          }
        ]
      };
    };

    const overallAdherence = medicationProgress.length > 0
      ? Math.round(medicationProgress.reduce((sum, m) => sum + m.adherencePercentage, 0) / medicationProgress.length)
      : 0;

    res.json({
      medicationProgress,
      overallAdherence,
      last7Days: generateChartData(7),
      last30Days: generateChartData(30)
    });
  } catch (err) {
    console.error('Error fetching progress data:', err.message);
    res.status(500).json({ msg: 'Server Error calculating progress' });
  }
};
