import http from 'http';
import pool from '../config/db.js';

function post(path, body) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(d) }));
      }
    );
    req.write(JSON.stringify(body));
    req.end();
  });
}

function getAuth(path, token) {
  return new Promise((resolve) => {
    http.get(
      `http://127.0.0.1:5000${path}`,
      { headers: { Authorization: `Bearer ${token}` } },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(d) }));
      }
    );
  });
}

async function testAudit() {
  console.log('Logging in Dr. Alice...');
  const loginRes = await post('/api/auth/login', {
    email: 'doctor.alice@med.com',
    password: 'pass123',
    role: 'doctor',
  });
  const token = loginRes.data.token;

  console.log('Fetching Bob Johnson (id=2) vitals to generate ePHI audit trail...');
  const vitalsRes = await getAuth('/api/patient/2/vital-tracker', token);
  console.log('Vitals status:', vitalsRes.status);

  // Check audit_logs table
  const [rows] = await pool.query('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 5');
  console.log('Latest audit logs from MySQL:', rows);

  if (rows.length > 0 && rows[0].action === 'VIEW_PATIENT_VITALS') {
    console.log('[SUCCESS] HIPAA Audit Log record verified in database!');
    process.exit(0);
  } else {
    console.error('[FAIL] Audit log not found');
    process.exit(1);
  }
}

testAudit().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
