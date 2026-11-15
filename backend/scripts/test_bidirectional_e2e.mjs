import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { app } from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('--- Starting Comprehensive E2E Verification ---');
  
  // Start in-process HTTP test server on port 5050
  const testPort = 5050;
  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(testPort, '127.0.0.1', resolve));
  console.log(`✓ In-process test server listening on 127.0.0.1:${testPort}`);

  const baseUrl = `http://127.0.0.1:${testPort}/api`;

  try {
    // 1. Doctor Login
    console.log('\n1. Testing Doctor Login (dr.alice@hospital.com)...');
    const docLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'dr.alice@hospital.com',
        password: 'password123',
        role: 'doctor'
      })
    });
    if (!docLoginRes.ok) {
      throw new Error(`Doctor login failed: ${docLoginRes.status} ${await docLoginRes.text()}`);
    }
    const docData = await docLoginRes.json();
    const docToken = docData.token;
    console.log('✓ Doctor login successful. Doctor ID:', docData.user.id);

    // 2. Patient Login
    console.log('\n2. Testing Patient Login (bob@hospital.com)...');
    const patLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bob@hospital.com',
        password: 'password123',
        role: 'patient'
      })
    });
    if (!patLoginRes.ok) {
      throw new Error(`Patient login failed: ${patLoginRes.status} ${await patLoginRes.text()}`);
    }
    const patData = await patLoginRes.json();
    const patToken = patData.token;
    console.log('✓ Patient login successful. Patient ID:', patData.user.id);

    // 3. Doctor Dashboard
    console.log('\n3. Testing Doctor Dashboard Fetch...');
    const dashRes = await fetch(`${baseUrl}/doctor/dashboard`, {
      headers: { 'x-auth-token': docToken }
    });
    if (!dashRes.ok) {
      throw new Error(`Doctor dashboard fetch failed: ${dashRes.status} ${await dashRes.text()}`);
    }
    const dashData = await dashRes.json();
    console.log('✓ Doctor dashboard loaded. Patients count:', dashData.patients.length);

    // 4. Lab Report Upload by Doctor
    console.log('\n4. Testing Lab Report Upload by Doctor...');
    const testPdfContent = '%PDF-1.4 sample diagnostic test report content';
    const formData = new FormData();
    const pdfBlob = new Blob([testPdfContent], { type: 'application/pdf' });
    formData.append('report_file', pdfBlob, 'Lipid_Panel_Report_2026.pdf');
    formData.append('patient_id', '2');

    const uploadRes = await fetch(`${baseUrl}/doctor/lab-reports`, {
      method: 'POST',
      headers: {
        'x-auth-token': docToken
      },
      body: formData
    });
    if (!uploadRes.ok) {
      throw new Error(`Lab report upload failed: ${uploadRes.status} ${await uploadRes.text()}`);
    }
    const uploadData = await uploadRes.json();
    console.log('✓ Lab report upload successful. Report ID:', uploadData.report.id, 'File:', uploadData.report.file_name);

    // 5. Patient fetches lab reports
    console.log('\n5. Testing Patient Viewing Uploaded Lab Reports...');
    const patReportsRes = await fetch(`${baseUrl}/patient/2/lab-reports`, {
      headers: { 'x-auth-token': patToken }
    });
    if (!patReportsRes.ok) {
      throw new Error(`Patient lab reports fetch failed: ${patReportsRes.status} ${await patReportsRes.text()}`);
    }
    const patReports = await patReportsRes.json();
    const foundReport = patReports.find(r => r.file_name === 'Lipid_Panel_Report_2026.pdf');
    if (!foundReport) {
      throw new Error('Uploaded lab report not found in patient reports list!');
    }
    console.log('✓ Patient can see newly uploaded lab report:', foundReport.file_name, 'Doctor Name:', foundReport.doctor_name);

    // 6. Patient sends chat message
    console.log('\n6. Testing Patient Sending Chat Message...');
    const patSendRes = await fetch(`${baseUrl}/chat/2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': patToken
      },
      body: JSON.stringify({ message_text: 'Hello Dr. Alice, please check my latest lipid report.' })
    });
    if (!patSendRes.ok) {
      throw new Error(`Patient chat send failed: ${patSendRes.status} ${await patSendRes.text()}`);
    }
    const patMsg = await patSendRes.json();
    console.log('✓ Patient message sent successfully. ID:', patMsg.id, 'Sender:', patMsg.sender_name);

    // 7. Doctor reads chat messages
    console.log('\n7. Testing Doctor Reading Chat Messages...');
    const docReadChatRes = await fetch(`${baseUrl}/chat/2`, {
      headers: { 'x-auth-token': docToken }
    });
    if (!docReadChatRes.ok) {
      throw new Error(`Doctor chat read failed: ${docReadChatRes.status} ${await docReadChatRes.text()}`);
    }
    const chatHistory = await docReadChatRes.json();
    const receivedMsg = chatHistory.find(m => m.id === patMsg.id);
    if (!receivedMsg) {
      throw new Error('Doctor could not find message sent by patient in chat history!');
    }
    console.log('✓ Doctor received message from patient:', receivedMsg.message_text);

    // 8. Doctor replies to chat message
    console.log('\n8. Testing Doctor Sending Reply in Chat...');
    const docReplyRes = await fetch(`${baseUrl}/chat/2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': docToken
      },
      body: JSON.stringify({ message_text: 'Received your report, Bob! Everything looks on track.' })
    });
    if (!docReplyRes.ok) {
      throw new Error(`Doctor reply failed: ${docReplyRes.status} ${await docReplyRes.text()}`);
    }
    const docReply = await docReplyRes.json();
    console.log('✓ Doctor reply sent. ID:', docReply.id, 'Sender:', docReply.sender_name);

    // 9. Patient reads reply
    console.log('\n9. Testing Patient Receiving Doctor Reply...');
    const patReadChatRes = await fetch(`${baseUrl}/chat/2`, {
      headers: { 'x-auth-token': patToken }
    });
    const updatedHistory = await patReadChatRes.json();
    const receivedReply = updatedHistory.find(m => m.id === docReply.id);
    if (!receivedReply) {
      throw new Error('Patient could not find Doctor reply in chat history!');
    }
    console.log('✓ Patient received Doctor reply:', receivedReply.message_text);

    // 10. Patient ticks dose adherence
    console.log('\n10. Testing Patient Ticking Dose Adherence...');
    const todayDate = new Date().toISOString().split('T')[0];
    const tickRes = await fetch(`${baseUrl}/adherence/tick`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': patToken
      },
      body: JSON.stringify({
        medication_id: 1,
        date: todayDate
      })
    });
    if (!tickRes.ok) {
      throw new Error(`Adherence tick failed: ${tickRes.status} ${await tickRes.text()}`);
    }
    const tickData = await tickRes.json();
    console.log('✓ Dose adherence marked as taken:', tickData.isTaken, 'Date:', tickData.date);

    // 11. Patient Vital Tracker Data
    console.log('\n11. Testing Patient Vital Tracker Data Fetch...');
    const vitalRes = await fetch(`${baseUrl}/patient/2/vital-tracker`, {
      headers: { 'x-auth-token': patToken }
    });
    if (!vitalRes.ok) {
      throw new Error(`Vital tracker fetch failed: ${vitalRes.status} ${await vitalRes.text()}`);
    }
    const vitalData = await vitalRes.json();
    console.log('✓ Vital tracker data loaded. Medications count:', vitalData.medications.length, 'Adherence keys:', Object.keys(vitalData.adherence));

    // 12. Doctor adds Health Tip
    console.log('\n12. Testing Doctor Adding Health Tip...');
    const tipRes = await fetch(`${baseUrl}/health-tips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': docToken
      },
      body: JSON.stringify({
        patient_id: 2,
        tip_text: 'Avoid caffeinated beverages after 6 PM.'
      })
    });
    if (!tipRes.ok) {
      throw new Error(`Add health tip failed: ${tipRes.status} ${await tipRes.text()}`);
    }
    console.log('✓ Doctor added health tip successfully.');

    // 13. Patient sees new Health Tip
    console.log('\n13. Testing Patient Seeing Newly Added Health Tip...');
    const vitalAfterTip = await (await fetch(`${baseUrl}/patient/2/vital-tracker`, {
      headers: { 'x-auth-token': patToken }
    })).json();
    const foundTip = vitalAfterTip.healthTips.find(t => t.tip_text.includes('Avoid caffeinated'));
    if (!foundTip) {
      throw new Error('Patient could not find newly added health tip!');
    }
    console.log('✓ Patient sees new health tip:', foundTip.tip_text);

    console.log('\n=============================================');
    console.log('🎉 ALL 13 END-TO-END VERIFICATION TESTS PASSED!');
    console.log('=============================================');
  } finally {
    testServer.close();
  }
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
