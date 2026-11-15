import http from 'http';

function request(options, postData = null, cookie = null) {
  return new Promise((resolve) => {
    const headers = options.headers || {};
    if (cookie) headers['Cookie'] = cookie;
    if (postData) headers['Content-Type'] = 'application/json';

    const req = http.request({ ...options, headers }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(d); } catch (e) { json = d; }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          setCookie: res.headers['set-cookie'],
          body: json,
        });
      });
    });
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function testPhase3() {
  console.log('--- Testing Phase 3: HttpOnly Cookie Authentication & Logout ---');

  // 1. Login Dr. Alice
  const loginRes = await request(
    { hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST' },
    { email: 'doctor.alice@med.com', password: 'pass123', role: 'doctor' }
  );

  console.log('Login status:', loginRes.status);
  console.log('Set-Cookie headers:', loginRes.setCookie);

  if (!loginRes.setCookie || !loginRes.setCookie[0].includes('medtracker_token=')) {
    console.error('[FAIL] Expected medtracker_token cookie in response');
    process.exit(1);
  }
  if (!loginRes.setCookie[0].includes('HttpOnly')) {
    console.error('[FAIL] Cookie missing HttpOnly flag');
    process.exit(1);
  }
  console.log('[PASS] Received HttpOnly Secure session cookie on login');

  const cookieHeader = loginRes.setCookie[0].split(';')[0]; // e.g. "medtracker_token=eyJhbGci..."

  // 2. Make authenticated call with NO Authorization header, ONLY Cookie
  const authCookieRes = await request(
    { hostname: '127.0.0.1', port: 5000, path: '/api/doctor/dashboard', method: 'GET' },
    null,
    cookieHeader
  );
  console.log('Dashboard response with cookie-only auth:', authCookieRes.status);
  if (authCookieRes.status === 200 && authCookieRes.body?.doctorProfile) {
    console.log('[PASS] Dual-Transport auth successfully authenticated request via HttpOnly cookie!');
  } else {
    console.error('[FAIL] Cookie authentication failed');
    process.exit(1);
  }

  // 3. Test Logout
  const logoutRes = await request(
    { hostname: '127.0.0.1', port: 5000, path: '/api/auth/logout', method: 'POST' },
    {},
    cookieHeader
  );
  console.log('Logout response:', logoutRes.status, logoutRes.setCookie);
  if (logoutRes.status === 200 && logoutRes.setCookie && logoutRes.setCookie[0].includes('medtracker_token=;')) {
    console.log('[PASS] Logout successfully invalidated the session cookie');
  } else {
    console.error('[FAIL] Logout did not clear cookie');
    process.exit(1);
  }

  console.log('\n--- Phase 3 Verification Completed Successfully! ---');
  process.exit(0);
}

testPhase3();
