import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

async function seedSecondDoctor() {
  console.log('=== SEEDING SECOND DOCTOR & MULTI-DOCTOR APPOINTMENT ===');
  try {
    // 1. Check or create Doctor Robert Chen
    const email = 'doctor.robert@med.com';
    const password = 'pass123';
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let doctorId;

    if (existing.length > 0) {
      doctorId = existing[0].id;
      console.log(`Doctor Robert Chen already exists with ID ${doctorId}`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const [userRes] = await pool.query(
        'INSERT INTO users (email, password, role) VALUES (?, ?, "doctor")',
        [email, hashedPassword]
      );
      doctorId = userRes.insertId;
      console.log(`Created user record for Doctor Robert Chen with ID ${doctorId}`);

      await pool.query(
        'INSERT INTO doctor_profiles (user_id, full_name, qualification, Contact) VALUES (?, ?, ?, ?)',
        [doctorId, 'Dr. Robert Chen', 'MD, Neurology', '+1-555-019-8234']
      );
      console.log('Created doctor_profiles record for Dr. Robert Chen');
    }

    // Ensure profile has qualification and full_name
    await pool.query(
      'UPDATE doctor_profiles SET full_name = "Dr. Robert Chen", qualification = "MD, Neurology", Contact = "+1-555-019-8234" WHERE user_id = ?',
      [doctorId]
    );

    // 2. Assign Bob Johnson (patient_id = 2) to Dr. Robert Chen
    const patientId = 2;
    const [mapCheck] = await pool.query(
      'SELECT * FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?',
      [doctorId, patientId]
    );
    if (mapCheck.length === 0) {
      await pool.query(
        'INSERT INTO doctor_patient_map (doctor_id, patient_id) VALUES (?, ?)',
        [doctorId, patientId]
      );
      console.log(`Assigned Bob Johnson (ID ${patientId}) to Dr. Robert Chen (ID ${doctorId})`);
    } else {
      console.log('Bob Johnson is already assigned to Dr. Robert Chen');
    }

    // 3. Create a Neurological appointment & medication for Bob Johnson
    const [appCheck] = await pool.query(
      'SELECT id FROM appointments WHERE patient_id = ? AND doctor_id = ?',
      [patientId, doctorId]
    );

    let appointmentId;
    if (appCheck.length > 0) {
      appointmentId = appCheck[0].id;
      console.log(`Existing appointment found: ${appointmentId}`);
    } else {
      const [appRes] = await pool.query(
        `INSERT INTO appointments (patient_id, doctor_id, appointment_date, present_complaint, final_diagnosis)
         VALUES (?, ?, '2026-10-25 10:00:00', 'Persistent chronic headaches and focal neuropathic tremors', 'Secondary Migraine Complex with Neuropathy')`,
        [patientId, doctorId]
      );
      appointmentId = appRes.insertId;
      console.log(`Created neurological appointment with ID ${appointmentId}`);
    }

    // 4. Prescribe Gabapentin 300mg from Dr. Robert Chen
    const [medCheck] = await pool.query(
      'SELECT id FROM medications WHERE appointment_id = ? AND name = "Gabapentin 300mg"',
      [appointmentId]
    );

    if (medCheck.length === 0) {
      const [medRes] = await pool.query(
        `INSERT INTO medications (appointment_id, name, dosage, start_date, end_date)
         VALUES (?, 'Gabapentin 300mg', '1 capsule daily at bedtime', '2026-10-25', '2026-11-24')`,
        [appointmentId]
      );
      console.log(`Prescribed Gabapentin 300mg with ID ${medRes.insertId}`);
    } else {
      console.log('Gabapentin 300mg already prescribed');
    }

    // 5. Clean up stale test row 839 for Fuiol (medication_id = 22)
    const [delRes] = await pool.query('DELETE FROM medication_adherence WHERE medication_id = 22');
    console.log(`Cleaned up stale Fuiol test adherence records: ${delRes.affectedRows}`);

    // 6. Verify Bob Johnson's care team
    const [assignedDoctors] = await pool.query(
      `SELECT dpm.doctor_id, dp.full_name, dp.qualification 
       FROM doctor_patient_map dpm
       JOIN doctor_profiles dp ON dpm.doctor_id = dp.user_id
       WHERE dpm.patient_id = ?`,
      [patientId]
    );
    console.log('Bob Johnson Assigned Doctors:', assignedDoctors);

    console.log('=== SEEDING COMPLETED SUCCESSFULLY ===');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    process.exit();
  }
}

seedSecondDoctor();
