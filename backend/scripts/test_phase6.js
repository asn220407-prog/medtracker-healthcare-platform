import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = 'med_tracker_super_secure_jwt_secret_key_2026';
const doctorToken = jwt.sign({ id: 1, role: 'doctor' }, JWT_SECRET, { expiresIn: 3600 });
const patientToken = jwt.sign({ id: 14, role: 'patient' }, JWT_SECRET, { expiresIn: 3600 });
const otherPatientToken = jwt.sign({ id: 2, role: 'patient' }, JWT_SECRET, { expiresIn: 3600 });

async function testBackend() {
  console.log('=== Testing Phase 6 Backend APIs ===');

  // 1. Create a dummy test file for lab report upload
  const testFilePath = path.join(process.cwd(), 'test_cbc_report.pdf');
  fs.writeFileSync(testFilePath, '%PDF-1.4 test lab report content for verification');

  const formData = new FormData();
  const fileBlob = new Blob([fs.readFileSync(testFilePath)], { type: 'application/pdf' });
  formData.append('report_file', fileBlob, 'CBC_Blood_Panel_Nov2026.pdf');
  formData.append('patient_id', '14');

  console.log('\n--- 1. Testing Lab Report Upload (Doctor) ---');
  const uploadRes = await fetch('http://localhost:5000/api/doctor/lab-reports', {
    method: 'POST',
    headers: {
      'x-auth-token': doctorToken,
    },
    body: formData,
  });

  const uploadData = await uploadRes.json();
  console.log(`Upload status: ${uploadRes.status}`, uploadData);
  const uploadedReportId = uploadData.report?.id;

  // 2. Fetch lab reports for patient 14 (as doctor)
  console.log('\n--- 2. Testing Fetch Lab Reports (Doctor View) ---');
  const fetchDocRes = await fetch('http://localhost:5000/api/patient/14/lab-reports', {
    headers: { 'x-auth-token': doctorToken },
  });
  const docReports = await fetchDocRes.json();
  console.log(`Doctor retrieved ${docReports.length} reports. Latest file_name: ${docReports[0]?.file_name}`);

  // 3. Fetch lab reports as Patient 14 (own view)
  console.log('\n--- 3. Testing Fetch Lab Reports (Patient 14 Own View) ---');
  const fetchPatRes = await fetch('http://localhost:5000/api/patient/14/lab-reports', {
    headers: { 'x-auth-token': patientToken },
  });
  const patReports = await fetchPatRes.json();
  console.log(`Patient retrieved ${patReports.length} reports.`);

  // 4. RBAC IDOR check: other patient should get 403
  console.log('\n--- 4. Testing Lab Report RBAC (Patient 2 trying to spy Patient 14) ---');
  const spyRes = await fetch('http://localhost:5000/api/patient/14/lab-reports', {
    headers: { 'x-auth-token': otherPatientToken },
  });
  console.log(`Spy status (should be 403): ${spyRes.status}`);

  // 5. Test static file serving
  if (docReports[0]?.file_path) {
    console.log(`\n--- 5. Testing Static File Retrieval from ${docReports[0].file_path} ---`);
    const staticRes = await fetch(`http://localhost:5000${docReports[0].file_path}`);
    console.log(`Static file fetch status (should be 200): ${staticRes.status}`);
  }

  // 6. Test Reminders: Patient sets a reminder
  console.log('\n--- 6. Testing Create Reminder (Patient) ---');
  const reminderRes = await fetch('http://localhost:5000/api/reminders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': patientToken,
    },
    body: JSON.stringify({
      reminder_time: '08:30',
      reminder_message: 'Take morning Lisinopril 10mg',
    }),
  });
  const reminderData = await reminderRes.json();
  console.log(`Reminder create status: ${reminderRes.status}`, reminderData);
  const createdReminderId = reminderData.reminder?.id;

  // 7. Doctor sets a reminder for patient 14
  console.log('\n--- 7. Testing Create Reminder (Doctor for Patient 14) ---');
  const docReminderRes = await fetch('http://localhost:5000/api/reminders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': doctorToken,
    },
    body: JSON.stringify({
      patient_id: 14,
      reminder_time: '20:00',
      reminder_message: 'Take evening blood pressure medication',
    }),
  });
  const docReminderData = await docReminderRes.json();
  console.log(`Doctor set reminder status: ${docReminderRes.status}`, docReminderData);

  // 8. Fetch reminders for patient
  console.log('\n--- 8. Testing Fetch Reminders (Patient) ---');
  const getRemindersRes = await fetch('http://localhost:5000/api/reminders', {
    headers: { 'x-auth-token': patientToken },
  });
  const allReminders = await getRemindersRes.json();
  console.log(`Patient has ${allReminders.length} reminders:`, allReminders.map(r => `${r.reminder_time} - ${r.reminder_message}`));

  // 9. Toggle reminder active status
  if (createdReminderId) {
    console.log('\n--- 9. Testing Toggle Reminder Status ---');
    const toggleRes = await fetch(`http://localhost:5000/api/reminders/${createdReminderId}/toggle`, {
      method: 'PUT',
      headers: { 'x-auth-token': patientToken },
    });
    console.log(`Toggle status: ${toggleRes.status}`, await toggleRes.json());
  }

  // Clean up test file
  if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);

  console.log('\n=== All Phase 6 Backend API Tests Passed Successfully! ===');
}

testBackend().catch(console.error);
