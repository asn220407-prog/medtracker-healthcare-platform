// Verification test script for Website Cybersecurity Checklist (.mjs for ES module)
import http from 'http';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json,
        });
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING CYBERSECURITY & COMPLIANCE VERIFICATION ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Check Security Headers on GET /
  console.log('--- Domain 7: HTTP Security Headers ---');
  const homeRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/',
    method: 'GET',
  });
  assert(homeRes.headers['x-frame-options'] === 'DENY', 'X-Frame-Options is DENY');
  assert(homeRes.headers['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options is nosniff');
  assert(homeRes.headers['referrer-policy'] === 'strict-origin-when-cross-origin', 'Referrer-Policy is strict-origin-when-cross-origin');
  assert(homeRes.headers['strict-transport-security']?.includes('max-age=31536000'), 'HSTS header configured');
  assert(homeRes.headers['cross-origin-opener-policy'] === 'same-origin', 'COOP is same-origin');
  assert(!!homeRes.headers['content-security-policy'], 'Content-Security-Policy is present');

  // 2. Centralized 404 Handler
  console.log('\n--- Domain 5 & 9: Unknown Path & Error Masking ---');
  const notFoundRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/non-existent-probe-route',
    method: 'GET',
  });
  assert(notFoundRes.statusCode === 404, 'Unknown path returns 404 status');
  assert(notFoundRes.body?.msg === 'Requested resource not found', 'Unknown path returns structured generic JSON');

  // 3. Login Authentication
  console.log('\n--- Domain 2: Authentication & Token Issuance ---');
  const docLogin = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'doctor.alice@med.com', password: 'pass123', role: 'doctor' }
  );
  assert(docLogin.statusCode === 200, 'Dr. Alice login successful (HTTP 200)');
  assert(!!docLogin.body?.token, 'JWT token issued to Dr. Alice');
  const docToken = docLogin.body?.token;

  const patientLogin = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'bob.johnson@gmail.com', password: 'pass123', role: 'patient' }
  );
  assert(patientLogin.statusCode === 200, 'Patient Bob login successful (HTTP 200)');
  assert(!!patientLogin.body?.token, 'JWT token issued to Patient Bob');
  const patientToken = patientLogin.body?.token;
  const bobId = patientLogin.body?.user?.id;

  // 4. Broken Object-Level Authorization (BOLA / IDOR) Defense
  console.log('\n--- Domain 2 & 11: Broken Object-Level Authorization (BOLA / IDOR) Defense ---');
  // Attempt to access unassigned patient 999999 as Dr. Alice
  const unassignedPatientId = 999999;

  // Test IDOR on PUT /api/doctor/patients/:patient_id
  const updateUnassigned = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/doctor/patients/${unassignedPatientId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${docToken}`,
      },
    },
    { fullName: 'Hacked Name', sex: 'Male', age: 40, weight: 80 }
  );
  assert(updateUnassigned.statusCode === 403, 'Blocked IDOR patient profile update (HTTP 403 Forbidden)');

  // Test IDOR on POST /api/doctor/appointments
  const appointmentUnassigned = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/doctor/appointments',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${docToken}`,
      },
    },
    {
      patient_id: unassignedPatientId,
      appointment_date: '2026-12-01',
      present_complaint: 'Testing IDOR',
      final_diagnosis: 'Blocked',
    }
  );
  assert(appointmentUnassigned.statusCode === 403, 'Blocked IDOR appointment injection (HTTP 403 Forbidden)');

  // Test IDOR on POST /api/medications
  const medUnassigned = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/medications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${docToken}`,
      },
    },
    {
      patient_id: unassignedPatientId,
      name: 'Unauthorized Drug',
      dosage: '100mg',
      start_date: '2026-11-01',
      end_date: '2026-11-30',
    }
  );
  assert(medUnassigned.statusCode === 403, 'Blocked IDOR medication prescription (HTTP 403 Forbidden)');

  // Test IDOR on POST /api/health-tips
  const tipUnassigned = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/health-tips',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${docToken}`,
      },
    },
    {
      patient_id: unassignedPatientId,
      tip_text: 'Unauthorized guidance',
    }
  );
  assert(tipUnassigned.statusCode === 403, 'Blocked IDOR health tip creation (HTTP 403 Forbidden)');

  // Test IDOR on GET /api/adherence/patient/:patient_id/:medication_id
  const adherenceUnassigned = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/adherence/patient/${unassignedPatientId}/1`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${docToken}`,
      },
    }
  );
  assert(adherenceUnassigned.statusCode === 403, 'Blocked IDOR adherence snooping (HTTP 403 Forbidden)');

  // 5. Patient Isolation Verification
  console.log('\n--- Domain 2: Patient-to-Patient Cross-Tenant Isolation ---');
  // Patient Bob attempts to view another patient's vital tracker (e.g., patient ID 999999 or 1)
  const bobSnoop = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/patient/${bobId === 2 ? 1 : 2}/vital-tracker`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${patientToken}`,
      },
    }
  );
  assert(bobSnoop.statusCode === 403, 'Blocked cross-patient record access (HTTP 403 Forbidden)');

  // Bob viewing his own vital tracker
  const bobOwnData = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/patient/${bobId}/vital-tracker`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${patientToken}`,
      },
    }
  );
  assert(bobOwnData.statusCode === 200, 'Authorized patient successfully retrieves own vital records (HTTP 200 OK)');

  // 6. Authorized Doctor Access to Assigned Patient
  console.log('\n--- Domain 2 & 11: Authorized Care-Team Access ---');
  const doctorAssignedAccess = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/patient/${bobId}/vital-tracker`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${docToken}`,
      },
    }
  );
  assert(doctorAssignedAccess.statusCode === 200, 'Dr. Alice successfully accesses assigned Patient Bob record (HTTP 200 OK)');

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
