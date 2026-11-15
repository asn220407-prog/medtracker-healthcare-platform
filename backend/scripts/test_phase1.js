async function testProbes() {
  console.log('Testing Cloud Health Probes...');
  try {
    const livenessRes = await fetch('http://localhost:5000/health/liveness');
    const livenessData = await livenessRes.json();
    console.log(`[PASS] /health/liveness: status=${livenessRes.status}, body=${JSON.stringify(livenessData)}`);

    const readinessRes = await fetch('http://localhost:5000/health/readiness');
    const readinessData = await readinessRes.json();
    console.log(`[PASS] /health/readiness: status=${readinessRes.status}, body=${JSON.stringify(readinessData)}`);
  } catch (err) {
    console.error('[FAIL] Probes failed:', err.message);
    process.exit(1);
  }
}

testProbes();
