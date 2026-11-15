import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createValidLabPdf({ patientName, patientId, testName, doctorName, date, reportId }) {
  const content = [
    'BT',
    '/F1 18 Tf',
    '50 740 Td',
    '(METROPOLITAN CLINICAL LABORATORIES) Tj',
    'ET',
    'BT',
    '/F2 9 Tf',
    '50 724 Td',
    '(ISO 15189 Accredited Diagnostic Testing Facility - Accreditation #MD-884920) Tj',
    'ET',
    '0.15 0.35 0.75 RG',
    '2 w',
    '50 712 m 562 712 l S',
    'BT',
    '/F1 10 Tf',
    '50 690 Td',
    '(PATIENT DEMOGRAPHICS & CLINICAL ORDER:) Tj',
    'ET',
    'BT',
    '/F2 9.5 Tf',
    '50 672 Td',
    `(${patientName.padEnd(30)} Patient ID: #${patientId}        Date: ${date}) Tj`,
    '0 -15 Td',
    `(${doctorName.padEnd(30)} Specimen: Whole Blood (EDTA)       Status: FINAL / VERIFIED) Tj`,
    '0 -15 Td',
    `(Order ID: LAB-2026-${reportId}            Fasting: Yes (12 hr)            Clinical Priority: ROUTINE) Tj`,
    'ET',
    '0.75 0.75 0.75 RG',
    '1 w',
    '50 625 m 562 625 l S',
    'BT',
    '/F1 12 Tf',
    '50 605 Td',
    `(${testName.toUpperCase()}) Tj`,
    'ET',
    'BT',
    '/F1 9 Tf',
    '50 585 Td',
    '(TEST PARAMETER                 RESULT       REFERENCE INTERVAL    UNIT        STATUS) Tj',
    'ET',
    '0.5 0.5 0.5 RG',
    '0.5 w',
    '50 578 m 562 578 l S',
    'BT',
    '/F2 9.5 Tf',
    '50 560 Td',
    '(White Blood Cell Count (WBC)   6.80         4.50 - 11.00          x10^3/uL    NORMAL) Tj',
    '0 -16 Td',
    '(Red Blood Cell Count (RBC)     4.92         4.30 - 5.90           x10^6/uL    NORMAL) Tj',
    '0 -16 Td',
    '(Hemoglobin (HGB)               15.2         13.5 - 17.5           g/dL        NORMAL) Tj',
    '0 -16 Td',
    '(Hematocrit (HCT)               44.8         41.0 - 50.0           %           NORMAL) Tj',
    '0 -16 Td',
    '(Platelet Count                 245          150 - 450             x10^3/uL    NORMAL) Tj',
    '0 -16 Td',
    '(Mean Corpuscular Volume (MCV)  91.0         80.0 - 100.0          fL          NORMAL) Tj',
    '0 -16 Td',
    '(Mean Corpuscular HGB (MCH)     30.9         27.0 - 33.0           pg          NORMAL) Tj',
    '0 -16 Td',
    '(Neutrophils Absolute           4.10         1.80 - 7.70           x10^3/uL    NORMAL) Tj',
    '0 -16 Td',
    '(Lymphocytes Absolute           2.10         1.00 - 4.80           x10^3/uL    NORMAL) Tj',
    '0 -16 Td',
    '(Eosinophils Absolute           0.18         0.02 - 0.50           x10^3/uL    NORMAL) Tj',
    'ET',
    '0.75 0.75 0.75 RG',
    '1 w',
    '50 375 m 562 375 l S',
    'BT',
    '/F1 10 Tf',
    '50 355 Td',
    '(PATHOLOGIST CLINICAL INTERPRETATION & OPINION:) Tj',
    'ET',
    'BT',
    '/F2 9 Tf',
    '50 338 Td',
    '(Specimen evaluated under automated flow cytometry and optical laser scatter.) Tj',
    '0 -14 Td',
    '(Red and white cell indices are within normative adult limits. No toxic granulation or atypical cells.) Tj',
    '0 -14 Td',
    '(Adherence to prescribed cardiovascular medication therapy recommended per primary care physician.) Tj',
    '0 -24 Td',
    '(Electronically Signed: Dr. Robert Vance, MD, FCAP - Chief of Pathology) Tj',
    '0 -14 Td',
    '(Digital Security Hash: SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069) Tj',
    'ET'
  ].join('\n');

  const streamBytes = Buffer.from(content, 'utf8');
  const streamLength = streamBytes.length;

  let body = '';
  const offsets = [];

  function addObj(str) {
    offsets.push(Buffer.byteLength(body, 'latin1'));
    body += str;
  }

  body += '%PDF-1.4\n%\xFF\xFF\xFF\xFF\n';

  // 1 0 obj: Catalog
  addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // 2 0 obj: Pages
  addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // 3 0 obj: Page
  addObj('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n');

  // 4 0 obj: Contents stream
  offsets.push(Buffer.byteLength(body, 'latin1'));
  body += `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${content}\nendstream\nendobj\n`;

  // 5 0 obj: F1
  addObj('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n');

  // 6 0 obj: F2
  addObj('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  // xref table
  const startxref = Buffer.byteLength(body, 'latin1');
  body += 'xref\n';
  body += '0 7\n';
  body += '0000000000 65535 f \r\n';
  for (let i = 0; i < 6; i++) {
    const offStr = String(offsets[i]).padStart(10, '0');
    body += `${offStr} 00000 n \r\n`;
  }
  body += 'trailer\n';
  body += '<< /Size 7 /Root 1 0 R >>\n';
  body += 'startxref\n';
  body += `${startxref}\n`;
  body += '%%EOF\n';

  return Buffer.from(body, 'latin1');
}

// Generate the sample CBC report for James Cameron (ID: 14) and Bob Johnson (ID: 2)
const reportsDir = path.join(__dirname, '../uploads/lab_reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Overwrite the existing corrupted file
const pdfBuffer = createValidLabPdf({
  patientName: 'James Cameron',
  patientId: '14',
  testName: 'Complete Blood Count (CBC) with Differential',
  doctorName: 'Dr. Alice Smith (MD, Cardiology)',
  date: '01-Nov-2026',
  reportId: '98421'
});

const targetFile = path.join(reportsDir, 'report-1793475577652-723560261.pdf');
fs.writeFileSync(targetFile, pdfBuffer);
console.log(`Successfully generated valid PDF at ${targetFile}, size: ${pdfBuffer.length} bytes`);
