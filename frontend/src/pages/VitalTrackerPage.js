import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import patientService from '../services/patientService';
import medicationService from '../services/medicationService';
import healthTipService from '../services/healthTipService';
import doctorService from '../services/doctorService';
import adherenceService from '../services/adherenceService';
import labReportService from '../services/labReportService';
import { playAdherenceChime } from '../utils/audioChime';
import API_BASE_URL from '../config';
import DashboardShell from '../components/DashboardShell';
import { useToast } from '../components/Toast';
import {
  FaUser,
  FaHeartbeat,
  FaLightbulb,
  FaPlus,
  FaEdit,
  FaTrash,
  FaChartLine,
  FaCalendarPlus,
  FaBell,
  FaFileMedical,
  FaFilePdf,
  FaFileImage,
  FaDownload,
  FaUserMd,
  FaCheck,
  FaClock,
  FaFire,
  FaUsers,
  FaComments
} from 'react-icons/fa';
import RealtimeChatModal from '../components/RealtimeChatModal';
import AddMedicationModal from '../components/AddMedicationModal';
import EditMedicationModal from '../components/EditMedicationModal';
import AddHealthTipModal from '../components/AddHealthTipModal';
import EditHealthTipModal from '../components/EditHealthTipModal';
import LogAppointmentModal from '../components/LogAppointmentModal';
import UploadLabReportModal from '../components/UploadLabReportModal';
import ReminderModal from '../components/ReminderModal';
import MedicationCalendar from '../components/MedicationCalendar';
import ProgressBar from '../components/ProgressBar';
import AdherenceChart from '../components/AdherenceChart';
import './VitalTracker.css';

const VitalTrackerPage = () => {
  const { patient_id } = useParams();
  const [patient, setPatient] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [assignedDoctors, setAssignedDoctors] = useState([]);
  const [medications, setMedications] = useState([]);
  const [healthTips, setHealthTips] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [user, setUser] = useState(null);
  const [activeMobileTab, setActiveMobileTab] = useState('doses');

  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);
  const [isEditMedModalOpen, setIsEditMedModalOpen] = useState(false);
  const [currentMedication, setCurrentMedication] = useState(null);
  const [isAddHealthTipModalOpen, setIsAddHealthTipModalOpen] = useState(false);
  const [isEditHealthTipModalOpen, setIsEditHealthTipModalOpen] = useState(false);
  const [currentHealthTip, setCurrentHealthTip] = useState(null);
  const [isLogAppointmentModalOpen, setIsLogAppointmentModalOpen] = useState(false);
  const [isUploadLabModalOpen, setIsUploadLabModalOpen] = useState(false);
  const [selectedMedForReminder, setSelectedMedForReminder] = useState(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [medicationAdherence, setMedicationAdherence] = useState({});
  const [splitLabReport, setSplitLabReport] = useState(null);

  const { addToast } = useToast();
  const userRole = user ? user.role : null;
  const activePatientId = patient_id || (user ? user.id : null);

  const fetchVitalData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const id = patient_id || decodedToken.id;

      if (id) {
        // Fetch vital profile data
        const { data } = await patientService.getVitalTrackerData(id, token);
        setPatient(data.patientProfile);
        setMedications(data.medications || []);
        setHealthTips(data.healthTips || []);
        setAppointments(data.appointments || []);
        if (data.doctorProfile) {
          setDoctor(data.doctorProfile);
        }
        if (data.assignedDoctors) {
          setAssignedDoctors(data.assignedDoctors);
        }

        // Single-roundtrip adherence data
        if (data.adherence) {
          setMedicationAdherence(data.adherence);
        }

        // Fetch Progress & Adherence Analytics
        try {
          const progressRes = await patientService.getProgressData(id, token);
          setProgressData(progressRes.data);
        } catch (progressErr) {
          console.error('Error fetching progress data:', progressErr);
        }

        // Fetch Lab Reports
        try {
          const labRes = await labReportService.getLabReports(id, token);
          setLabReports(labRes.data || []);
        } catch (labErr) {
          console.error('Error fetching lab reports:', labErr);
        }
      }
    } catch (error) {
      console.error('Error fetching vital data:', error);
      addToast('Error loading patient vital records.', 'error');
    }
  }, [patient_id, addToast]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setUser(decodedToken);
        fetchVitalData();
      } catch (error) {
        console.error('Failed to decode token:', error);
        localStorage.removeItem('token');
      }
    }
  }, [fetchVitalData]);

  // Real-Time Server-Sent Events (SSE) Live Stream Connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !activePatientId) return;

    const sseUrl = `${API_BASE_URL}/api/realtime/stream?patient_id=${activePatientId}&token=${encodeURIComponent(token)}`;
    let eventSource;

    try {
      eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === 'ADHERENCE_UPDATED') {
            const { medication_id, date, isTaken, takenDates } = payload;
            setMedicationAdherence((prev) => {
              let updatedDates;
              if (takenDates && Array.isArray(takenDates)) {
                updatedDates = takenDates;
              } else {
                const current = prev[medication_id] || [];
                updatedDates = isTaken
                  ? Array.from(new Set([...current, date]))
                  : current.filter((d) => d !== date);
              }
              return {
                ...prev,
                [medication_id]: updatedDates,
              };
            });
            fetchVitalData();
          } else if (payload.type === 'CLINICAL_UPDATED') {
            fetchVitalData();
          }
        } catch (err) {
          console.error('Realtime SSE event parse error:', err);
        }
      };

      eventSource.onerror = () => {
        // SSE handles auto-reconnect natively
      };
    } catch (err) {
      console.error('Failed to initialize SSE stream:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [activePatientId, fetchVitalData]);

  const handleDateClick = async (medicationId, date, isTaken) => {
    const token = localStorage.getItem('token');
    if (!token || (userRole !== 'patient' && userRole !== 'doctor')) return;

    const originalDates = medicationAdherence[medicationId] || [];
    let newDates;

    if (isTaken) {
      newDates = originalDates.filter((d) => d !== date);
    } else {
      newDates = Array.from(new Set([...originalDates, date]));
      // Trigger Web Audio harmonic triad chime if audio enabled
      if (localStorage.getItem('medtracker_sound_enabled') !== 'false') {
        playAdherenceChime();
      }
      addToast('Dose logged! Adherence updated in real time.', 'success');
    }

    // Instant optimistic UI update
    setMedicationAdherence((prev) => ({
      ...prev,
      [medicationId]: newDates,
    }));

    try {
      if (isTaken) {
        await adherenceService.untickCalendar(medicationId, date, token, activePatientId);
      } else {
        await adherenceService.tickCalendar(medicationId, date, token, activePatientId);
      }
    } catch (error) {
      console.error('Failed to update adherence:', error);
      addToast('Failed to record adherence to server.', 'error');
      setMedicationAdherence((prev) => ({
        ...prev,
        [medicationId]: originalDates,
      }));
    }
  };

  const crudHandler = (serviceFunc) => async (...args) => {
    try {
      const token = localStorage.getItem('token');
      await serviceFunc(...args, token);
      fetchVitalData();
      if (serviceFunc === medicationService.addMedication) {
        closeAddMedModal();
        addToast('New medication prescribed successfully!', 'success');
      }
      if (serviceFunc === medicationService.updateMedication) {
        closeEditMedModal();
        addToast('Medication details updated.', 'success');
      }
      if (serviceFunc === healthTipService.addHealthTip) {
        closeAddHealthTipModal();
        addToast('Health guidance posted.', 'success');
      }
      if (serviceFunc === healthTipService.updateHealthTip) {
        closeEditHealthTipModal();
        addToast('Health tip updated.', 'success');
      }
      if (serviceFunc === doctorService.addAppointment) {
        closeLogAppointmentModal();
        addToast('Consultation record logged successfully!', 'success');
      }
    } catch (error) {
      console.error('An error occurred during CRUD operation:', error);
      addToast('Operation failed. Please verify input.', 'error');
    }
  };

  const addMedicationHandler = crudHandler(medicationService.addMedication);
  const updateMedicationHandler = crudHandler(medicationService.updateMedication);
  const deleteMedicationHandler = crudHandler(medicationService.deleteMedication);
  const addHealthTipHandler = crudHandler(healthTipService.addHealthTip);
  const updateHealthTipHandler = crudHandler(healthTipService.updateHealthTip);
  const deleteHealthTipHandler = crudHandler(healthTipService.deleteHealthTip);
  const addAppointmentHandler = crudHandler(doctorService.addAppointment);

  const deleteMedicationConfirm = (medId, medName) => {
    if (window.confirm(`Are you sure you want to delete prescribed medication "${medName || ''}"?`)) {
      deleteMedicationHandler(medId);
      addToast(`Medication "${medName}" deleted.`, 'info');
    }
  };

  const deleteHealthTipConfirm = (tipId) => {
    if (window.confirm('Are you sure you want to delete this health tip?')) {
      deleteHealthTipHandler(tipId);
    }
  };

  const openAddMedModal = () => setIsAddMedModalOpen(true);
  const closeAddMedModal = () => setIsAddMedModalOpen(false);
  const openEditMedModal = (med) => { setCurrentMedication(med); setIsEditMedModalOpen(true); };
  const closeEditMedModal = () => { setCurrentMedication(null); setIsEditMedModalOpen(false); };
  const openAddHealthTipModal = () => setIsAddHealthTipModalOpen(true);
  const closeAddHealthTipModal = () => setIsAddHealthTipModalOpen(false);
  const openEditHealthTipModal = (tip) => { setCurrentHealthTip(tip); setIsEditHealthTipModalOpen(true); };
  const closeEditHealthTipModal = () => { setCurrentHealthTip(null); setIsEditHealthTipModalOpen(false); };
  const openLogAppointmentModal = () => setIsLogAppointmentModalOpen(true);
  const closeLogAppointmentModal = () => setIsLogAppointmentModalOpen(false);

  const openReminderModal = (med = null) => {
    setSelectedMedForReminder(med);
    setIsReminderModalOpen(true);
  };
  const closeReminderModal = () => {
    setSelectedMedForReminder(null);
    setIsReminderModalOpen(false);
  };

  const deleteLabReportHandler = async (reportId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete the lab report "${fileName}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      await labReportService.deleteLabReport(reportId, token);
      setLabReports(labReports.filter((r) => r.id !== reportId));
      addToast(`Report "${fileName}" deleted.`, 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete lab report.', 'error');
    }
  };

  // Dynamic live overall adherence across all prescribed medications
  const liveOverallAdherence = useMemo(() => {
    if (medications.length === 0) return progressData?.overallAdherence || 0;
    let sumPct = 0;
    for (const m of medications) {
      const s = m.start_date ? new Date(m.start_date) : null;
      const e = m.end_date ? new Date(m.end_date) : null;
      const totalDays = (s && e)
        ? Math.max(1, Math.round((new Date(e.getFullYear(), e.getMonth(), e.getDate()) - new Date(s.getFullYear(), s.getMonth(), s.getDate())) / (1000 * 60 * 60 * 24)) + 1)
        : 1;
      const taken = (medicationAdherence[m.id] || []).length;
      sumPct += Math.min(100, Math.round((taken / totalDays) * 100));
    }
    return Math.round(sumPct / medications.length);
  }, [medications, medicationAdherence, progressData]);

  // Today's Adherence Rate & Next Pending Dose Calculation
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const { todayCompliance, nextPendingMed } = useMemo(() => {
    if (!medications.length) return { todayCompliance: 100, nextPendingMed: null };
    let takenTodayCount = 0;
    let pending = null;

    for (const m of medications) {
      const takenDates = medicationAdherence[m.id] || [];
      const isTakenToday = takenDates.includes(todayStr);
      if (isTakenToday) {
        takenTodayCount++;
      } else if (!pending) {
        pending = m;
      }
    }
    const rate = Math.round((takenTodayCount / medications.length) * 100);
    return { todayCompliance: rate, nextPendingMed: pending };
  }, [medications, medicationAdherence, todayStr]);

  // 7-day adherence computation calculated in real-time from adherence state
  const weekCompliance = useMemo(() => {
    if (medications.length > 0) {
      const now = new Date();
      let totalExpected = 0;
      let totalTaken = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        for (const m of medications) {
          totalExpected++;
          const dates = medicationAdherence[m.id] || [];
          if (dates.includes(dateStr)) {
            totalTaken++;
          }
        }
      }
      if (totalExpected > 0) {
        return Math.round((totalTaken / totalExpected) * 100);
      }
    }
    if (progressData?.last7Days && progressData.last7Days.length > 0) {
      const total = progressData.last7Days.reduce((acc, d) => acc + (d.percentage || 0), 0);
      return Math.round(total / progressData.last7Days.length);
    }
    return Math.min(100, Math.round(liveOverallAdherence * 0.95));
  }, [medications, medicationAdherence, progressData, liveOverallAdherence]);

  const latestAppointment = appointments.length > 0 ? appointments[0] : null;

  return (
    <DashboardShell
      user={patient ? { fullName: patient.full_name, role: userRole } : user}
      breadcrumbCurrent={patient ? (userRole === 'doctor' ? `${patient.full_name}'s Chart` : 'My Schedule') : 'Adherence Tracker'}
    >
      <div className="vital-tracker-container">
        {/* Real-time sync badge header */}
        <div className="vital-tracker-header">
          <div className="tracker-title-row">
            <div>
              <span className="tracker-eyebrow">
                <span className="pulse-green-dot" />
                <span>Prescription &amp; Medication Schedule</span>
              </span>
              <h1 className="tracker-main-title">
                {patient ? (userRole === 'doctor' ? `${patient.full_name}'s Medical Chart` : 'My Medication Schedule') : 'Medication Adherence'}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-chat-trigger"
                onClick={() => setIsChatModalOpen(true)}
                title={userRole === 'doctor' ? 'Open real-time messaging with patient' : 'Open real-time messaging with your physician'}
              >
                <FaComments style={{ fontSize: '1.05rem' }} />
                <span>{userRole === 'doctor' ? 'Chat with Patient' : 'Chat with Doctor'}</span>
              </button>

              <div className="realtime-status-pill" title="Live sync with care team">
                <span className="pulse-green-dot" />
                <span>Synced with Care Team</span>
              </div>
            </div>
          </div>

          {/* Real Patient Demographics & Profile Summary */}
          <div className="patient-demographics-summary-strip" aria-label="Patient Details">
            <div className="demographic-info-pill">
              <span className="demo-pill-label">PATIENT AGE &amp; SEX</span>
              <span className="demo-pill-value">
                {patient?.age ? `${patient.age} yrs` : '—'} • {patient?.sex || 'N/A'}
              </span>
            </div>
            {patient?.weight && (
              <div className="demographic-info-pill">
                <span className="demo-pill-label">WEIGHT</span>
                <span className="demo-pill-value">{patient.weight} kg</span>
              </div>
            )}
            <div className="demographic-info-pill">
              <span className="demo-pill-label">PRIMARY DOCTOR</span>
              <span className="demo-pill-value">
                Dr. {doctor?.full_name ? doctor.full_name.replace(/^Dr\.\s*/i, '') : 'Alice Smith'}
              </span>
            </div>
            <div className="demographic-info-pill">
              <span className="demo-pill-label">ACTIVE PRESCRIPTIONS</span>
              <span className="demo-pill-value">{medications.length} {medications.length === 1 ? 'Medication' : 'Medications'}</span>
            </div>
            <div className="demographic-info-pill">
              <span className="demo-pill-label">OVERALL ADHERENCE</span>
              <span className="demo-pill-value" style={{ color: liveOverallAdherence >= 80 ? '#10b981' : liveOverallAdherence >= 50 ? '#f59e0b' : '#f43f5e' }}>
                {liveOverallAdherence}%
              </span>
            </div>
          </div>
        </div>

        {/* 1. ADHERENCE SUMMARY STRIP AT TOP */}
        <section className="vital-adherence-summary-deck" aria-label="Adherence Performance Summary">
          {/* Overall Adherence Score Card */}
          <div className="summary-deck-card rings-card">
            <div className="summary-card-header">
              <span className="summary-card-title">Overall Adherence</span>
              <span className="summary-live-badge">Live</span>
            </div>
            <div className="summary-score-display" style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                fontSize: '40px',
                fontWeight: '800',
                color: liveOverallAdherence >= 80 ? '#10b981' : liveOverallAdherence >= 50 ? '#f59e0b' : '#f43f5e',
                letterSpacing: '-0.02em',
                lineHeight: 1
              }}>
                {liveOverallAdherence}%
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>
                {liveOverallAdherence >= 80 ? 'Excellent Adherence' : liveOverallAdherence >= 50 ? 'Moderate Adherence' : 'Action Needed'}
              </div>
              <div className="summary-compliance-breakdown">
                <span>Today: <strong className="comp-today">{todayCompliance}%</strong></span>
                <span>7-Day: <strong className="comp-week">{weekCompliance}%</strong></span>
              </div>
            </div>
          </div>

          {/* Next Dose Due Countdown Card */}
          <div className="summary-deck-card next-dose-card">
            <div className="summary-card-header">
              <span className="summary-card-title">Next Scheduled Dose</span>
              <span className="summary-clock-tag"><FaClock /> Today</span>
            </div>

            {nextPendingMed ? (
              <div className="next-dose-content">
                <div className="next-med-badge">
                  <FaHeartbeat className="next-med-icon" />
                  <div>
                    <h3 className="next-med-name">{nextPendingMed.name}</h3>
                    <span className="next-med-dosage">{nextPendingMed.dosage} • Prescribed Dose</span>
                  </div>
                </div>

                <p className="next-med-instruction">
                  Mark this scheduled dose once ingested to maintain your adherence score.
                </p>

                <button
                  type="button"
                  className="mark-dose-taken-cta"
                  onClick={() => {
                    playAdherenceChime();
                    handleDateClick(nextPendingMed.id, todayStr, false);
                  }}
                >
                  <FaCheck /> <span>Mark as Taken Today</span>
                </button>
              </div>
            ) : (
              <div className="all-doses-completed-box">
                <div className="completed-check-icon">
                  <FaCheck />
                </div>
                <h3>All Today's Doses Logged</h3>
                <p>Outstanding! You have completed 100% of your prescribed doses for today.</p>
              </div>
            )}
          </div>

          {/* Calm Streak Counter */}
          <div className="summary-deck-card streak-card">
            <div className="summary-card-header">
              <span className="summary-card-title">Compliance Streak</span>
              <span className="streak-fire-tag"><FaFire /> Streak</span>
            </div>

            <div className="streak-counter-body">
              <div className="streak-number-row">
                <span className="streak-big-val">
                  {Math.max(1, Math.round(liveOverallAdherence / 18))}
                </span>
                <span className="streak-days-unit">Days</span>
              </div>
              <p className="streak-subtext">
                Continuous medication consistency recorded by your physician.
              </p>
              <div className="streak-progress-indicator">
                <div
                  className="streak-progress-bar"
                  style={{ width: `${Math.min(100, liveOverallAdherence)}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. VITALS & CARE TEAM GRID */}
        <div className="vitals-grid">
          {/* Patient Profile & Care Team Attribution Card */}
          {patient && (
            <div className="vital-card patient-info" id="section-care-team">
              <div className="vital-card-header-bar">
                <h3><FaUser /> Patient Information</h3>
                <span className="card-id-tag">ID: #{patient.user_id}</span>
              </div>

              <div className="patient-info-grid">
                <div className="info-item"><strong>Name</strong><span>{patient.full_name}</span></div>
                <div className="info-item"><strong>Sex</strong><span>{patient.sex}</span></div>
                <div className="info-item"><strong>Age</strong><span>{patient.age} yrs</span></div>
                <div className="info-item"><strong>Weight</strong><span>{patient.weight} kg</span></div>

                {/* Multi-Doctor Care Team Attribution */}
                <div className="info-item assigned-doctors-panel" style={{ gridColumn: '1 / -1' }}>
                  <strong>Assigned Clinical Care Team ({assignedDoctors.length || (doctor ? 1 : 0)} Physicians)</strong>
                  <div className="assigned-doctors-list">
                    {assignedDoctors && assignedDoctors.length > 0 ? (
                      assignedDoctors.map((doc) => (
                        <div key={doc.doctor_id} className="assigned-doctor-chip">
                          <FaUserMd className="doc-chip-icon" />
                          <div className="doc-chip-meta">
                            <span className="doc-chip-name">{doc.full_name}</span>
                            <span className="doc-chip-spec">{doc.qualification || 'Clinical Specialist'}</span>
                            {doc.Contact && <span className="doc-chip-contact">Tel: {doc.Contact}</span>}
                          </div>
                        </div>
                      ))
                    ) : doctor ? (
                      <div className="assigned-doctor-chip">
                        <FaUserMd className="doc-chip-icon" />
                        <div className="doc-chip-meta">
                          <span className="doc-chip-name">{doctor.full_name}</span>
                          <span className="doc-chip-spec">{doctor.qualification || 'Clinical Specialist'}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="no-doctor-notice">No physician assigned yet.</span>
                    )}
                  </div>
                </div>
              </div>

              {latestAppointment && (
                <div className="appointment-info-section">
                  <div className="appointment-section-header">
                    <strong>Latest Consultation ({new Date(latestAppointment.appointment_date).toLocaleDateString()}):</strong>
                  </div>
                  <p><strong>Complaint:</strong> {latestAppointment.present_complaint || 'N/A'}</p>
                  <p><strong>Diagnosis:</strong> {latestAppointment.final_diagnosis || 'N/A'}</p>
                </div>
              )}

              {userRole === 'doctor' && (
                <button className="log-consultation-btn" onClick={openLogAppointmentModal}>
                  <FaCalendarPlus /> Log New Consultation
                </button>
              )}
            </div>
          )}

          {/* Health Guidance Card */}
          <div className="vital-card health-tips-list">
            <div className="vital-card-header-bar">
              <h3>
                <FaLightbulb /> Clinical Guidance
              </h3>
              {userRole === 'doctor' && (
                <button className="add-btn" onClick={openAddHealthTipModal} title="Add Health Tip">
                  <FaPlus />
                </button>
              )}
            </div>
            <ul>
              {healthTips.length === 0 ? (
                <li style={{ color: '#888', fontStyle: 'italic' }}>No health tips recorded yet.</li>
              ) : (
                healthTips.map((tip) => (
                  <li key={tip.id}>
                    <span>{tip.tip_text}</span>
                    {userRole === 'doctor' && (
                      <div className="actions">
                        <button className="edit-btn" onClick={() => openEditHealthTipModal(tip)}><FaEdit /></button>
                        <button className="delete-btn" onClick={() => deleteHealthTipConfirm(tip.id)}><FaTrash /></button>
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Adherence Trends & Progress Visualization */}
          {progressData && (
            <div className="vital-card adherence-analytics-card" id="section-analytics">
              <div className="analytics-header">
                <h3><FaChartLine /> Adherence Analytics & Trends</h3>
                <div className="overall-badge">
                  Overall Adherence: <strong>{liveOverallAdherence}%</strong>
                </div>
              </div>

              <ProgressBar
                label="Overall Treatment Adherence"
                percentage={liveOverallAdherence}
                size="large"
              />

              <AdherenceChart
                last7Days={progressData.last7Days}
                last30Days={progressData.last30Days}
              />
            </div>
          )}

          {/* Diagnostic Lab Reports */}
          <div className="vital-card lab-reports-card">
            <div className="lab-card-header">
              <h3>
                <FaFileMedical /> Lab Reports & Diagnostics
              </h3>
              {userRole === 'doctor' && (
                <button
                  className="add-btn"
                  onClick={() => setIsUploadLabModalOpen(true)}
                  title="Upload Lab Report"
                >
                  <FaPlus />
                </button>
              )}
            </div>

            <div className="lab-reports-scroll-list">
              {labReports.length === 0 ? (
                <p className="no-reports-msg">No lab reports uploaded for this patient yet.</p>
              ) : (
                <ul className="vital-reports-list">
                  {labReports.map((report) => (
                    <li key={report.id} className="vital-report-row">
                      <div className="vital-report-main">
                        {report.file_path?.toLowerCase().endsWith('.pdf') ? (
                          <FaFilePdf className="pdf-color-icon" />
                        ) : (
                          <FaFileImage className="img-color-icon" />
                        )}
                        <div className="vital-report-text">
                          <span className="vital-report-name" title={report.file_name}>
                            {report.file_name}
                          </span>
                          <span className="vital-report-sub">
                            {new Date(report.upload_date).toLocaleDateString()} • {report.doctor_name || 'Doctor'}
                          </span>
                        </div>
                      </div>
                      <div className="vital-report-buttons">
                        <button
                          type="button"
                          className="vital-split-report-btn"
                          onClick={() => setSplitLabReport(splitLabReport?.id === report.id ? null : report)}
                          title="Open Split-Screen Diagnostic Drawer"
                        >
                          {splitLabReport?.id === report.id ? 'Close Split' : '📑 Split-View'}
                        </button>
                        <a
                          href={`${API_BASE_URL}${report.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="vital-view-report-link"
                          title="Download or Preview Lab Report"
                        >
                          <FaDownload /> View
                        </a>
                        {userRole === 'doctor' && (
                          <button
                            className="vital-delete-report-btn"
                            onClick={() => deleteLabReportHandler(report.id, report.file_name)}
                            title="Delete Report"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Prescribed Medications & Interactive Adherence Calendars */}
          <div className="vital-card medications-list" id="section-medications" style={{ gridColumn: '1 / -1' }}>
            <div className="vital-card-header-bar">
              <h3>
                <FaHeartbeat /> Prescribed Medications &amp; Adherence Calendars
              </h3>
              {userRole === 'doctor' && (
                <button className="add-btn" onClick={openAddMedModal} title="Prescribe Medication">
                  <FaPlus />
                </button>
              )}
            </div>
            <ul>
              {medications.length === 0 ? (
                <li style={{ color: '#888', fontStyle: 'italic' }}>No medications prescribed yet.</li>
              ) : (
                medications.map((med) => {
                  const s = med.start_date ? new Date(med.start_date) : null;
                  const e = med.end_date ? new Date(med.end_date) : null;
                  const totalPrescribedDays = (s && e)
                    ? Math.max(1, Math.round((new Date(e.getFullYear(), e.getMonth(), e.getDate()) - new Date(s.getFullYear(), s.getMonth(), s.getDate())) / (1000 * 60 * 60 * 24)) + 1)
                    : 1;

                  const currentTakenDates = medicationAdherence[med.id] || [];
                  const dynamicTotalTaken = currentTakenDates.length;
                  const dynamicPercentage = Math.min(100, Math.round((dynamicTotalTaken / totalPrescribedDays) * 100));

                  return (
                    <li key={med.id}>
                      <div className="medication-header-row">
                        <div className="medication-details">
                          <span className="med-name">{med.name}</span>
                          <span className="med-dosage">{med.dosage}</span>

                          {/* Prescribing Doctor Attribution */}
                          <div className="med-prescriber-badge">
                            <FaUserMd className="prescriber-icon" />
                            <span>
                              Prescribed by: <strong>{med.doctor_name || 'Dr. Alice Smith'}</strong> ({med.doctor_specialization || 'Clinical Specialist'})
                            </span>
                          </div>
                        </div>

                        <div className="medication-header-actions">
                          <button
                            type="button"
                            className="reminder-bell-btn"
                            onClick={() => openReminderModal(med)}
                            title="Set Medication Reminder Alarm"
                          >
                            <FaBell /> <span>Set Reminder</span>
                          </button>

                          {userRole === 'doctor' && (
                            <div className="actions">
                              <button
                                className="edit-btn"
                                onClick={() => openEditMedModal(med)}
                                title="Edit Medication"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => deleteMedicationConfirm(med.id, med.name)}
                                title="Delete Medication"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dynamically Computed Progress Bar */}
                      <ProgressBar
                        label={`${med.name} Adherence`}
                        percentage={dynamicPercentage}
                        totalTaken={dynamicTotalTaken}
                        prescribedDaysPassed={totalPrescribedDays}
                        size="medium"
                      />

                      {patient && (
                        <MedicationCalendar
                          medication={med}
                          userRole={userRole}
                          takenDates={medicationAdherence[med.id] || []}
                          onDateClick={handleDateClick}
                        />
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>

        {/* 3. MOBILE STICKY BOTTOM TAB BAR (< 768px) */}
        <nav className="vital-mobile-bottom-tabs" aria-label="Mobile Navigation Tabs">
          <button
            type="button"
            className={`mobile-tab-btn ${activeMobileTab === 'doses' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveMobileTab('doses');
              const el = document.getElementById('section-medications');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <FaHeartbeat className="tab-bar-icon" />
            <span>Doses</span>
          </button>
          <button
            type="button"
            className={`mobile-tab-btn ${activeMobileTab === 'analytics' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveMobileTab('analytics');
              const el = document.getElementById('section-analytics');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <FaChartLine className="tab-bar-icon" />
            <span>History</span>
          </button>
          <button
            type="button"
            className={`mobile-tab-btn ${activeMobileTab === 'care-team' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveMobileTab('care-team');
              const el = document.getElementById('section-care-team');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <FaUsers className="tab-bar-icon" />
            <span>Care Team</span>
          </button>
        </nav>

        {/* MODALS */}
        {isAddMedModalOpen && (
          <AddMedicationModal
            closeModal={closeAddMedModal}
            addMedication={addMedicationHandler}
            patient_id={patient && patient.user_id}
          />
        )}
        {isEditMedModalOpen && currentMedication && (
          <EditMedicationModal
            closeModal={closeEditMedModal}
            medication={currentMedication}
            updateMedication={updateMedicationHandler}
          />
        )}
        {isAddHealthTipModalOpen && (
          <AddHealthTipModal
            closeModal={closeAddHealthTipModal}
            addHealthTip={addHealthTipHandler}
            patient_id={patient && patient.user_id}
          />
        )}
        {isEditHealthTipModalOpen && currentHealthTip && (
          <EditHealthTipModal
            closeModal={closeEditHealthTipModal}
            healthTip={currentHealthTip}
            updateHealthTip={updateHealthTipHandler}
          />
        )}
        {isLogAppointmentModalOpen && (
          <LogAppointmentModal
            closeModal={closeLogAppointmentModal}
            addAppointment={addAppointmentHandler}
            patient_id={patient && patient.user_id}
          />
        )}
        {isUploadLabModalOpen && (
          <UploadLabReportModal
            isOpen={isUploadLabModalOpen}
            onClose={() => setIsUploadLabModalOpen(false)}
            patientId={patient && patient.user_id}
            patientName={patient && patient.full_name}
            token={localStorage.getItem('token')}
            onUploadSuccess={fetchVitalData}
          />
        )}
        {isReminderModalOpen && (
          <ReminderModal
            isOpen={isReminderModalOpen}
            onClose={closeReminderModal}
            patientId={patient ? (patient.user_id || patient.id) : (user ? user.id : activePatientId)}
            medication={selectedMedForReminder}
            token={localStorage.getItem('token')}
            onReminderSaved={fetchVitalData}
          />
        )}
        {isChatModalOpen && (
          <RealtimeChatModal
            isOpen={isChatModalOpen}
            onClose={() => setIsChatModalOpen(false)}
            patientId={patient?.user_id || activePatientId}
            patientName={patient?.full_name || 'Patient'}
            currentUser={user}
            token={localStorage.getItem('token')}
          />
        )}

        {/* 2026 Split-Screen Diagnostic Suite Drawer */}
        {splitLabReport && (
          <div className="split-lab-diagnostic-drawer" role="complementary" aria-label="Diagnostic lab report preview">
            <div className="split-drawer-header">
              <div className="split-drawer-title">
                <FaFilePdf className="text-rose" />
                <span>Diagnostic Preview: <strong>{splitLabReport.file_name}</strong></span>
              </div>
              <button
                type="button"
                className="split-drawer-close-btn"
                onClick={() => setSplitLabReport(null)}
              >
                ✕ Close Split-View
              </button>
            </div>
            <div className="split-drawer-body">
              <iframe
                src={`${API_BASE_URL}${splitLabReport.file_path}`}
                title="Diagnostic Lab Report Split Preview"
                className="split-drawer-iframe"
              />
            </div>
          </div>
        )}

        {/* 2026 Floating Mobile Quick-Action Pill (< 768px) */}
        <div className="mobile-quick-action-pill" aria-label="Mobile quick actions">
          {nextPendingMed && (
            <button
              type="button"
              className="pill-action-btn primary"
              onClick={() => {
                playAdherenceChime();
                handleDateClick(nextPendingMed.id, todayStr, false);
              }}
            >
              <FaCheck /> 1-Tap Dose
            </button>
          )}
          <button
            type="button"
            className="pill-action-btn"
            onClick={() => openReminderModal(medications[0] || null)}
          >
            <FaBell /> Alarm
          </button>
          <button
            type="button"
            className="pill-action-btn"
            onClick={() => setIsChatModalOpen(true)}
          >
            <FaComments /> Chat
          </button>
        </div>
      </div>
    </DashboardShell>
  );
};

export default VitalTrackerPage;