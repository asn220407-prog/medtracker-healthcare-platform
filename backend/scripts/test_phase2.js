import http from 'http';

function makeRequest(options, postData = null) {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(d); } catch (e) { json = d; }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function testPhase2() {
  console.log('--- Testing Phase 2: Observability & Zod Schema Validation ---');

  // 1. Check X-Request-Id on /health/liveness
  const liveRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/health/liveness',
    method: 'GET',
  });
  console.log('X-Request-Id header:', liveRes.headers['x-request-id']);
  if (!liveRes.headers['x-request-id']) {
    console.error('[FAIL] Missing X-Request-Id header');
    process.exit(1);
  }
  console.log('[PASS] X-Request-Id correlation tracking active');

  // 2. Doctor Login
  const loginRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'doctor.alice@med.com', password: 'pass123', role: 'doctor' }
  );
  const token = loginRes.body.token;

  // 3. Test Zod Validation: Send invalid medication with end_date earlier than start_date
  const invalidMedRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/medications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      patient_id: 2,
      name: 'Amoxicillin',
      dosage: '500mg',
      start_date: '2026-11-20',
      end_date: '2026-11-10', // Invalid: end before start!
    }
  );
  console.log('Invalid date validation response:', invalidMedRes.status, invalidMedRes.body);
  if (invalidMedRes.status === 400 && invalidMedRes.body?.msg?.includes('End date cannot be earlier than start date')) {
    console.log('[PASS] Zod correctly blocked invalid date range with structured error');
  } else {
    console.error('[FAIL] Zod date validation did not catch invalid range');
    process.exit(1);
  }

  // 4. Test Zod Validation: Send invalid patient update with negative age & invalid sex
  const invalidPatientRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/doctor/patients/2',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      fullName: 'Bob Johnson',
      sex: 'AlienGender', // Invalid enum
      age: -5, // Invalid negative age
      weight: 75,
    }
  );
  console.log('Invalid demographic validation response:', invalidPatientRes.status, invalidPatientRes.body);
  if (invalidPatientRes.status === 400 && invalidPatientRes.body?.errors?.length > 0) {
    console.log('[PASS] Zod correctly blocked invalid demographic payload with field-level errors');
  } else {
    console.error('[FAIL] Zod demographic validation did not catch errors');
    process.exit(1);
  }

  // 5. Test Zod Validation: Send valid medication
  const validMedRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/medications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      patient_id: 2,
      name: 'Atorvastatin',
      dosage: '20mg daily at bedtime',
      start_date: '2026-11-01',
      end_date: '2026-11-30',
    }
  );
  console.log('Valid medication response:', validMedRes.status, validMedRes.body);
  if (validMedRes.status === 200 && validMedRes.body?.id) {
    console.log('[PASS] Zod permitted valid medication payload and returned new ID');
  } else {
    console.error('[FAIL] Valid medication rejected by schema');
    process.exit(1);
  }

  console.log('\n--- Phase 2 Verification Completed Successfully! ---');
  process.exit(0);
}

testPhase2();
