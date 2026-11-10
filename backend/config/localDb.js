import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');
const dbFile = path.join(dataDir, 'local_db.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial seed data with bcrypt hashed password: "password123"
const initialSeed = {
  users: [
    {
      id: 1,
      email: 'dr.alice@hospital.com',
      password: '$2b$10$mAJj0NE7MqT8AwQLv0IFBe90sVzQw5bbhylNUKNnzTbpDTxgXXniu',
      role: 'doctor',
      created_at: new Date('2026-11-01T08:00:00Z').toISOString()
    },
    {
      id: 2,
      email: 'bob@hospital.com',
      password: '$2b$10$mAJj0NE7MqT8AwQLv0IFBe90sVzQw5bbhylNUKNnzTbpDTxgXXniu',
      role: 'patient',
      created_at: new Date('2026-11-01T08:00:00Z').toISOString()
    }
  ],
  doctor_profiles: [
    {
      user_id: 1,
      full_name: 'Dr. Alice Smith',
      qualification: 'MD - Internal Medicine, Cardiology Specialist',
      contact_details: 'alice.smith@hospital.com • (555) 234-5678'
    }
  ],
  patient_profiles: [
    {
      user_id: 2,
      full_name: 'Bob Johnson',
      sex: 'Male',
      age: 48,
      weight: 82.5
    }
  ],
  doctor_patient_map: [
    { id: 1, doctor_id: 1, patient_id: 2 }
  ],
  appointments: [
    {
      id: 1,
      patient_id: 2,
      doctor_id: 1,
      appointment_date: '2026-11-01 10:00:00',
      present_complaint: 'Mild hypertension and morning fatigue. Routine blood pressure check.',
      final_diagnosis: 'Stage 1 Essential Hypertension with mild hypercholesterolemia. Commenced daily regimen.'
    }
  ],
  medications: [
    {
      id: 1,
      appointment_id: 1,
      name: 'Amoxicillin',
      dosage: '500mg, 1 capsule 3 times daily after meals',
      start_date: '2026-11-01',
      end_date: '2026-11-15'
    },
    {
      id: 2,
      appointment_id: 1,
      name: 'Lisinopril',
      dosage: '10mg, 1 tablet once daily in the morning',
      start_date: '2026-11-01',
      end_date: '2026-11-30'
    },
    {
      id: 3,
      appointment_id: 1,
      name: 'Metformin',
      dosage: '500mg, 1 tablet twice daily with meals',
      start_date: '2026-11-01',
      end_date: '2026-11-30'
    }
  ],
  medication_adherence: [
    { id: 1, medication_id: 1, patient_id: 2, taken_date: '2026-11-01' },
    { id: 2, medication_id: 1, patient_id: 2, taken_date: '2026-11-02' },
    { id: 3, medication_id: 1, patient_id: 2, taken_date: '2026-11-03' },
    { id: 4, medication_id: 1, patient_id: 2, taken_date: '2026-11-05' },
    { id: 5, medication_id: 1, patient_id: 2, taken_date: '2026-11-06' },
    { id: 6, medication_id: 1, patient_id: 2, taken_date: '2026-11-07' },
    { id: 7, medication_id: 2, patient_id: 2, taken_date: '2026-11-01' },
    { id: 8, medication_id: 2, patient_id: 2, taken_date: '2026-11-02' },
    { id: 9, medication_id: 2, patient_id: 2, taken_date: '2026-11-03' },
    { id: 10, medication_id: 2, patient_id: 2, taken_date: '2026-11-04' },
    { id: 11, medication_id: 2, patient_id: 2, taken_date: '2026-11-06' },
    { id: 12, medication_id: 2, patient_id: 2, taken_date: '2026-11-07' }
  ],
  health_tips: [
    {
      id: 1,
      patient_id: 2,
      doctor_id: 1,
      tip_text: 'Maintain a low-sodium diet (< 2g/day) and drink at least 2.5 liters of water daily.'
    },
    {
      id: 2,
      patient_id: 2,
      doctor_id: 1,
      tip_text: 'Engage in 30 minutes of moderate aerobic walking every morning.'
    }
  ],
  reminders: [
    {
      id: 1,
      user_id: 2,
      patient_id: 2,
      medication_id: 1,
      reminder_time: '08:00',
      reminder_message: 'Take morning Amoxicillin dose',
      is_active: 1
    }
  ],
  messages: [
    {
      id: 1,
      patient_id: 2,
      sender_id: 1,
      sender_role: 'doctor',
      sender_name: 'Dr. Alice Smith',
      message_text: 'Hello Bob, please let me know if you experience any mild dizziness after the morning Lisinopril dose.',
      created_at: new Date('2026-11-02T09:00:00Z').toISOString()
    },
    {
      id: 2,
      patient_id: 2,
      sender_id: 2,
      sender_role: 'patient',
      sender_name: 'Bob Johnson',
      message_text: 'Good morning Dr. Alice, feeling much better today. Blood pressure readings have stabilized at 122/82.',
      created_at: new Date('2026-11-02T09:30:00Z').toISOString()
    }
  ],
  lab_reports: [
    {
      id: 1,
      patient_id: 2,
      doctor_id: 1,
      file_name: 'Complete_Blood_Count_CBC_Panel.pdf',
      file_path: '/uploads/lab_reports/sample_cbc.pdf',
      upload_date: new Date('2026-11-02T11:00:00Z').toISOString()
    }
  ]
};

let db = null;
function loadDb() {
  if (db) return db;
  if (fs.existsSync(dbFile)) {
    try {
      db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
      if (!db.lab_reports) db.lab_reports = [];
      if (!db.messages) db.messages = [];
      if (!db.reminders) db.reminders = [];
      return db;
    } catch (e) {
      console.warn('Corrupt local db file, recreating seed...');
    }
  }
  db = JSON.parse(JSON.stringify(initialSeed));
  saveDb();
  return db;
}

function saveDb() {
  if (db) {
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf8');
  }
}

export const localQuery = async (sql, params = []) => {
  const data = loadDb();
  const cleanSql = sql.replace(/\s+/g, ' ').trim();
  const p = params || [];

  // ==========================================
  // 1. USERS & PROFILES
  // ==========================================
  if (cleanSql.includes('FROM users WHERE email = ? AND role = ?')) {
    const rows = data.users.filter(u => u.email.toLowerCase() === String(p[0]).toLowerCase() && u.role === p[1]);
    return [rows, []];
  }

  if (cleanSql.includes('FROM users WHERE email = ?')) {
    const rows = data.users.filter(u => u.email.toLowerCase() === String(p[0]).toLowerCase());
    return [rows, []];
  }

  if (cleanSql.includes('FROM users WHERE id = ?')) {
    const rows = data.users.filter(u => Number(u.id) === Number(p[0]));
    return [rows, []];
  }

  if (cleanSql.startsWith('INSERT INTO users')) {
    const nextId = (data.users.reduce((max, u) => Math.max(max, u.id), 0) || 0) + 1;
    const newUser = { id: nextId, email: p[0], password: p[1], role: p[2], created_at: new Date().toISOString() };
    data.users.push(newUser);
    saveDb();
    return [{ insertId: nextId, affectedRows: 1 }, []];
  }

  if (cleanSql.startsWith('DELETE FROM users WHERE id = ?')) {
    const uid = Number(p[0]);
    data.users = data.users.filter(u => Number(u.id) !== uid);
    data.patient_profiles = data.patient_profiles.filter(pt => Number(pt.user_id) !== uid);
    data.doctor_patient_map = data.doctor_patient_map.filter(m => Number(m.patient_id) !== uid && Number(m.doctor_id) !== uid);
    data.appointments = data.appointments.filter(a => Number(a.patient_id) !== uid);
    data.medications = data.medications.filter(m => {
      const appt = data.appointments.find(a => Number(a.id) === Number(m.appointment_id));
      return appt ? Number(appt.patient_id) !== uid : true;
    });
    data.medication_adherence = data.medication_adherence.filter(ad => Number(ad.patient_id) !== uid);
    data.health_tips = data.health_tips.filter(h => Number(h.patient_id) !== uid);
    data.messages = data.messages.filter(msg => Number(msg.patient_id) !== uid);
    data.reminders = data.reminders.filter(r => Number(r.patient_id) !== uid && Number(r.user_id) !== uid);
    data.lab_reports = data.lab_reports.filter(lr => Number(lr.patient_id) !== uid);
    saveDb();
    return [{ affectedRows: 1 }, []];
  }

  if (cleanSql.includes('FROM doctor_profiles WHERE user_id = ?')) {
    const rows = data.doctor_profiles.filter(d => Number(d.user_id) === Number(p[0]));
    return [rows, []];
  }

  if (cleanSql.includes('FROM doctor_profiles')) {
    return [data.doctor_profiles, []];
  }

  if (cleanSql.startsWith('INSERT INTO doctor_profiles')) {
    data.doctor_profiles.push({ user_id: Number(p[0]), full_name: p[1], qualification: p[2], contact_details: p[3] });
    saveDb();
    return [{ insertId: Number(p[0]), affectedRows: 1 }, []];
  }

  if (cleanSql.includes('FROM patient_profiles WHERE user_id = ?')) {
    const rows = data.patient_profiles.filter(pt => Number(pt.user_id) === Number(p[0]));
    return [rows, []];
  }

  if (cleanSql.startsWith('INSERT INTO patient_profiles')) {
    data.patient_profiles.push({ user_id: Number(p[0]), full_name: p[1], sex: p[2], age: Number(p[3]), weight: Number(p[4]) });
    saveDb();
    return [{ insertId: Number(p[0]), affectedRows: 1 }, []];
  }

  if (cleanSql.includes('UPDATE patient_profiles')) {
    const targetId = Number(p[4]);
    const patient = data.patient_profiles.find(pt => Number(pt.user_id) === targetId);
    if (patient) {
      patient.full_name = p[0];
      patient.sex = p[1];
      patient.age = Number(p[2]);
      patient.weight = Number(p[3]);
      saveDb();
    }
    return [{ affectedRows: 1 }, []];
  }

  // ==========================================
  // 2. DOCTOR PATIENT MAP
  // ==========================================
  if (cleanSql.includes('FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?')) {
    const rows = data.doctor_patient_map.filter(m => Number(m.doctor_id) === Number(p[0]) && Number(m.patient_id) === Number(p[1]));
    return [rows, []];
  }

  if (cleanSql.includes('FROM doctor_patient_map WHERE patient_id = ?')) {
    const rows = data.doctor_patient_map.filter(m => Number(m.patient_id) === Number(p[0]));
    return [rows, []];
  }

  if (cleanSql.startsWith('INSERT INTO doctor_patient_map')) {
    const nextId = (data.doctor_patient_map.reduce((max, m) => Math.max(max, m.id), 0) || 0) + 1;
    data.doctor_patient_map.push({ id: nextId, doctor_id: Number(p[0]), patient_id: Number(p[1]) });
    saveDb();
    return [{ insertId: nextId, affectedRows: 1 }, []];
  }

  if (cleanSql.startsWith('DELETE FROM doctor_patient_map WHERE doctor_id = ? AND patient_id = ?')) {
    data.doctor_patient_map = data.doctor_patient_map.filter(m => !(Number(m.doctor_id) === Number(p[0]) && Number(m.patient_id) === Number(p[1])));
    saveDb();
    return [{ affectedRows: 1 }, []];
  }

  // Doctor roster table
  if (cleanSql.includes('FROM patient_profiles p JOIN doctor_patient_map dpm') || cleanSql.includes('FROM patient_profiles p')) {
    const doctorId = Number(p[0]);
    const assignedMaps = data.doctor_patient_map.filter(m => Number(m.doctor_id) === doctorId);
    const assignedPatientIds = assignedMaps.map(m => m.patient_id);
    const rows = data.patient_profiles
      .filter(pt => assignedPatientIds.includes(pt.user_id))
      .map(pt => {
        const appts = data.appointments.filter(a => Number(a.patient_id) === Number(pt.user_id));
        const latestAppt = appts.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))[0];
        const takenCount = data.medication_adherence.filter(ad => Number(ad.patient_id) === Number(pt.user_id)).length;
        const adherenceRate = takenCount > 0 ? Math.min(100, Math.round((takenCount / 12) * 100)) : 0;
        return {
          user_id: pt.user_id,
          full_name: pt.full_name,
          sex: pt.sex || 'Male',
          age: pt.age || 48,
          weight: pt.weight || 75,
          appointment_date: latestAppt ? latestAppt.appointment_date : null,
          adherence_rate: adherenceRate
        };
      });
    return [rows, []];
  }

  // Patient assigned doctors (supports multi-doctor care teams)
  if (cleanSql.includes('FROM doctor_profiles d JOIN doctor_patient_map dpm') || cleanSql.includes('FROM doctor_patient_map dpm JOIN doctor_profiles dp') || cleanSql.includes('WHERE dpm.patient_id = ?')) {
    const patientId = Number(p[0]);
    const assignedMaps = data.doctor_patient_map.filter(m => Number(m.patient_id) === patientId);
    const doctorIds = assignedMaps.map(m => m.doctor_id);
    const rows = data.doctor_profiles
      .filter(d => doctorIds.includes(d.user_id))
      .map(d => {
        const u = data.users.find(usr => Number(usr.id) === Number(d.user_id)) || {};
        return {
          doctor_id: d.user_id,
          user_id: d.user_id,
          full_name: d.full_name,
          qualification: d.qualification,
          Contact: d.contact_details,
          contact_details: d.contact_details,
          email: u.email || ''
        };
      });
    return [rows, []];
  }

  // ==========================================
  // 3. APPOINTMENTS
  // ==========================================
  if (cleanSql.includes('FROM appointments WHERE patient_id = ? AND doctor_id = ?')) {
    const rows = data.appointments.filter(a => Number(a.patient_id) === Number(p[0]) && Number(a.doctor_id) === Number(p[1]));
    return [rows, []];
  }

  if (cleanSql.includes('FROM appointments') && (cleanSql.includes('patient_id = ?') || cleanSql.includes('a.patient_id = ?'))) {
    const patientId = Number(p[0]);
    const rows = data.appointments
      .filter(a => Number(a.patient_id) === patientId)
      .map(a => {
        const doc = data.doctor_profiles.find(d => Number(d.user_id) === Number(a.doctor_id)) || {};
        return {
          ...a,
          doctor_name: doc.full_name || 'Dr. Alice Smith',
          doctor_specialization: doc.qualification || 'Internal Medicine'
        };
      })
      .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
    return [rows, []];
  }

  if (cleanSql.startsWith('INSERT INTO appointments')) {
    const nextId = (data.appointments.reduce((max, a) => Math.max(max, a.id), 0) || 0) + 1;
    data.appointments.push({
      id: nextId,
      patient_id: Number(p[0]),
      doctor_id: Number(p[1]),
      appointment_date: p[2] || new Date().toISOString(),
      present_complaint: p[3] || '',
      final_diagnosis: p[4] || ''
    });
    saveDb();
    return [{ insertId: nextId, affectedRows: 1 }, []];
  }

  // ==========================================
  // 4. MEDICATIONS
  // ==========================================
  if (cleanSql.includes('WHERE m.appointment_id IN') || cleanSql.includes('m.appointment_id IN')) {
    const rawIds = Array.isArray(p[0]) ? p[0] : [p[0]];
    const targetIds = rawIds.map(Number);
    const rows = data.medications
      .filter(m => targetIds.includes(Number(m.appointment_id)))
      .map(m => {
        const appt = data.appointments.find(a => Number(a.id) === Number(m.appointment_id)) || {};
        const doc = data.doctor_profiles.find(d => Number(d.user_id) === Number(appt.doctor_id)) || {};
        const usr = data.users.find(u => Number(u.id) === Number(appt.doctor_id)) || {};
        return {
          ...m,
          doctor_id: appt.doctor_id,
          doctor_name: doc.full_name || 'Dr. Alice Smith',
          doctor_specialization: doc.qualification || 'Internal Medicine',
          doctor_email: usr.email || 'dr.alice@hospital.com'
        };
      });
    return [rows, []];
  }
  // ==========================================
  if (cleanSql.includes('FROM medications m JOIN appointments a ON m.appointment_id = a.id WHERE a.patient_id = ?')) {
    const patientId = Number(p[0]);
    const patientApptIds = data.appointments.filter(a => Number(a.patient_id) === patientId).map(a => a.id);
    const rows = data.medications.filter(m => patientApptIds.includes(m.appointment_id));
    return [rows, []];
  }

  if (cleanSql.includes('FROM medications m JOIN appointments a ON m.appointment_id = a.id WHERE m.id = ?')) {
    const medId = Number(p[0]);
    const med = data.medications.find(m => Number(m.id) === medId);
    if (!med) return [[], []];
    const appt = data.appointments.find(a => Number(a.id) === Number(med.appointment_id)) || {};
    return [[{ id: med.id, patient_id: appt.patient_id, doctor_id: appt.doctor_id, name: med.name }], []];
  }

  if (cleanSql.includes('FROM medications WHERE id = ?')) {
    const medId = Number(p[0]);
    const med = data.medications.find(m => Number(m.id) === medId);
    return [med ? [med] : [], []];
  }

  if (cleanSql.startsWith('INSERT INTO medications')) {
    const nextId = (data.medications.reduce((max, m) => Math.max(max, m.id), 0) || 0) + 1;
    data.medications.push({
      id: nextId,
      appointment_id: Number(p[0]),
      name: p[1],
      dosage: p[2],
      start_date: p[3],
      end_date: p[4]
    });
    saveDb();
    return [{ insertId: nextId, affectedRows: 1 }, []];
  }

  if (cleanSql.startsWith('UPDATE medications SET name = ?, dosage = ?, start_date = ?, end_date = ? WHERE id = ?')) {
    const med = data.medications.find(m => Number(m.id) === Number(p[4]));
    if (med) {
      med.name = p[0];
      med.dosage = p[1];
      med.start_date = p[2];
      med.end_date = p[3];
      saveDb();
    }
    return [{ affectedRows: 1 }, []];
  }

  if (cleanSql.startsWith('DELETE FROM medications WHERE id = ?')) {
    data.medications = data.medications.filter(m => Number(m.id) !== Number(p[0]));
    saveDb();
    return [{ affectedRows: 1 }, []];
  }

  // ==========================================
  // 5. MEDICATION ADHERENCE
  // ==========================================
  if (cleanSql.includes('FROM medication_adherence WHERE medication_id = ? AND taken_date = ? AND patient_id = ?')) {
    const rows = data.medication_adherence.filter(ad =>
      Number(ad.medication_id) === Number(p[0]) &&
      ad.taken_date === p[1] &&
      Number(ad.patient_id) === Number(p[2])
    );
    return [rows, []];
  }

  if (cleanSql.includes('FROM medication_adherence WHERE medication_id = ? AND patient_id = ?')) {
    const rows = data.medication_adherence.filter(ad =>
      Number(ad.medication_id) === Number(p[0]) &&
      Number(ad.patient_id) === Number(p[1])
    );
    return [rows, []];
  }

  if (cleanSql.includes('FROM medication_adherence WHERE medication_id = ?')) {
    const rows = data.medication_adherence.filter(ad => Number(ad.medication_id) === Number(p[0]));
    return [rows, []];
  }

  if (cleanSql.includes('FROM medication_adherence WHERE patient_id = ?')) {
    const rows = data.medication_adherence.filter(ad => Number(ad.patient_id) === Number(p[0]));
    return [rows, []];
  }

  if (cleanSql.includes('INTO medication_adherence')) {
    const medId = Number(p[0]);
    const patId = Number(p[1]);
    const tDate = String(p[2]);
    const exists = data.medication_adherence.some(ad =>
      Number(ad.medication_id) === medId &&
      Number(ad.patient_id) === patId &&
      ad.taken_date === tDate
    );
    let nextId = 0;
    if (!exists) {
      nextId = (data.medication_adherence.reduce((max, ad) => Math.max(max, ad.id), 0) || 0) + 1;
      data.medication_adherence.push({
        id: nextId,
        medication_id: medId,
        patient_id: patId,
        taken_date: tDate
      });
      saveDb();
    }
    return [{ insertId: nextId, affectedRows: exists ? 0 : 1 }, []];
  }

  if (cleanSql.includes('DELETE FROM medication_adherence')) {
    const medId = Number(p[0]);
    // Handle both parameter orders: [medication_id, patient_id, taken_date] or [medication_id, taken_date, patient_id]
    let patId, tDate;
    if (typeof p[1] === 'string' && p[1].includes('-')) {
      tDate = p[1];
      patId = Number(p[2]);
    } else {
      patId = Number(p[1]);
      tDate = String(p[2]);
    }
    data.medication_adherence = data.medication_adherence.filter(ad =>
      !(Number(ad.medication_id) === medId && Number(ad.patient_id) === patId && ad.taken_date === tDate)
    );
    saveDb();
    return [{ affectedRows: 1 }, []];
  }

  // ==========================================
  // 6. HEALTH TIPS
  // ==========================================
  if (cleanSql.includes('FROM health_tips WHERE id = ?')) {
    const rows = data.health_tips.filter(h => Number(h.id) === Number(p[0]));
    return [rows, []];
  }

  if (cleanSql.includes('FROM health_tips WHERE patient_id = ?')) {
    const rows = data.health_tips.filter(h => Number(h.patient_id) === Number(p[0]));
    return [rows, []];
  }

  if (cleanSql.startsWith('INSERT INTO health_tips')) {
    const nextId = (data.health_tips.reduce((max, h) => Math.max(max, h.id), 0) || 0) + 1;
    data.health_tips.push({
      id: nextId,
      patient_id: Number(p[0]),
      doctor_id: Number(p[1]),
      tip_text: p[2],
      created_at: new Date().toISOString()
    });
    saveDb();
    return [{ insertId: nextId, affectedRows: 1 }, []];
  }

  if (cleanSql.startsWith('UPDATE health_tips SET tip_text = ? WHERE id = ?')) {
    const tip = data.health_tips.find(h => Number(h.id) === Number(p[1]));
    if (tip) {
      tip.tip_text = p[0];
      saveDb();
    }
    return [{ affectedRows: 1 }, []];
  }

  if (cleanSql.startsWith('DELETE FROM health_tips WHERE id = ?')) {
    data.health_tips = data.health_tips.filter(h => Number(h.id) !== Number(p[0]));
    saveDb();
    return [{ affectedRows: 1 }, []];
  }

  // ==========================================
  // 7. LAB REPORTS (All query variations)
  // ==========================================
  if (cleanSql.includes('FROM lab_reports WHERE id = ?')) {
    const rows = data.lab_reports.filter(lr => Number(lr.id) === Number(p[0]));
    return [rows, []];
  }

  if (cleanSql.includes('FROM lab_reports')) {
    const patientId = Number(p[0]);
    const rows = data.lab_reports
      .filter(lr => Number(lr.patient_id) === patientId)
      .map(lr => {
        const doc = data.doctor_profiles.find(d => Number(d.user_id) === Number(lr.doctor_id));
        return {
          id: lr.id,
          patient_id: lr.patient_id,
          doctor_id: lr.doctor_id,
          file_name: lr.file_name,
          file_path: lr.file_path,
          upload_date: lr.upload_date,
          doctor_name: doc ? doc.full_name : 'Doctor'
        };
      })
      .sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));
    return [rows, []];
  }

  if (cleanSql.startsWith('INSERT INTO lab_reports')) {
    const nextId = (data.lab_reports.reduce((max, lr) => Math.max(max, lr.id), 0) || 0) + 1;
    data.lab_reports.push({
      id: nextId,
      patient_id: Number(p[0]),
      doctor_id: Number(p[1]),
      file_name: p[2],
      file_path: p[3],
      upload_date: new Date().toISOString()
    });
    saveDb();
    return [{ insertId: nextId, affectedRows: 1 }, []];
  }

  if (cleanSql.startsWith('DELETE FROM lab_reports WHERE id = ?')) {
    data.lab_reports = data.lab_reports.filter(lr => Number(lr.id) !== Number(p[0]));
    saveDb();
    return [{ affectedRows: 1 }, []];
  }

  // ==========================================
  // 8. CHAT MESSAGES (All query variations)
  // ==========================================
  if (cleanSql.includes('FROM messages WHERE patient_id = ?')) {
    const patientId = Number(p[0]);
    const rows = data.messages
      .filter(m => Number(m.patient_id) === patientId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return [rows, []];
  }

  if (cleanSql.startsWith('INSERT INTO messages')) {
    const nextId = (data.messages.reduce((max, m) => Math.max(max, m.id), 0) || 0) + 1;
    const newMsg = {
      id: nextId,
      patient_id: Number(p[0]),
      sender_id: Number(p[1]),
      sender_role: p[2],
      sender_name: p[3],
      message_text: p[4],
      created_at: new Date().toISOString()
    };
    data.messages.push(newMsg);
    saveDb();
    return [{ insertId: nextId, affectedRows: 1 }, []];
  }

  // ==========================================
  // 9. REMINDERS (All query variations)
  // ==========================================
  if (cleanSql.includes('FROM reminders WHERE id = ?')) {
    const rows = data.reminders.filter(r => Number(r.id) === Number(p[0]));
    return [rows, []];
  }

  if (cleanSql.includes('FROM reminders')) {
    const idParam = Number(p[0]);
    const rows = data.reminders
      .filter(r => Number(r.user_id) === idParam || Number(r.patient_id) === idParam)
      .map(r => {
        const med = data.medications.find(m => Number(m.id) === Number(r.medication_id));
        const user = data.users.find(u => Number(u.id) === Number(r.user_id));
        const doc = data.doctor_profiles.find(d => Number(d.user_id) === Number(r.user_id));
        const pat = data.patient_profiles.find(pt => Number(pt.user_id) === Number(r.user_id));
        return {
          id: r.id,
          user_id: r.user_id,
          patient_id: r.patient_id,
          medication_id: r.medication_id,
          reminder_time: r.reminder_time,
          reminder_message: r.reminder_message,
          is_active: r.is_active,
          created_at: r.created_at || new Date().toISOString(),
          medication_name: med ? med.name : null,
          medication_dosage: med ? med.dosage : null,
          creator_role: user ? user.role : 'patient',
          creator_name: doc ? doc.full_name : pat ? pat.full_name : 'User'
        };
      })
      .sort((a, b) => (a.reminder_time || '').localeCompare(b.reminder_time || ''));
    return [rows, []];
  }

  if (cleanSql.startsWith('INSERT INTO reminders')) {
    const nextId = (data.reminders.reduce((max, r) => Math.max(max, r.id), 0) || 0) + 1;
    data.reminders.push({
      id: nextId,
      user_id: Number(p[0]),
      patient_id: Number(p[1]),
      medication_id: p[2] ? Number(p[2]) : null,
      reminder_time: p[3],
      reminder_message: p[4] || '',
      is_active: 1
    });
    saveDb();
    return [{ insertId: nextId, affectedRows: 1 }, []];
  }

  if (cleanSql.startsWith('UPDATE reminders SET is_active = ? WHERE id = ?')) {
    const rem = data.reminders.find(r => Number(r.id) === Number(p[1]));
    if (rem) {
      rem.is_active = Number(p[0]);
      saveDb();
    }
    return [{ affectedRows: 1 }, []];
  }

  if (cleanSql.startsWith('DELETE FROM reminders WHERE id = ?')) {
    data.reminders = data.reminders.filter(r => Number(r.id) !== Number(p[0]));
    saveDb();
    return [{ affectedRows: 1 }, []];
  }

  console.log('[localDb Fallback Query unhandled]:', cleanSql);
  return [[], []];
};
