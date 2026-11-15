import React, { useState, useEffect, useCallback } from 'react';
import reminderService from '../services/reminderService';
import { FaBell, FaTrash, FaCheck, FaTimes, FaClock, FaVolumeUp } from 'react-icons/fa';
import { playAdherenceChime } from '../utils/audioChime';
import './Modal.css';
import './ReminderModal.css';

const ReminderModal = ({ patientId, medication, token, onClose }) => {
  const effectiveToken = token || localStorage.getItem('token');
  const effectivePatientId = patientId || (() => {
    try {
      if (!effectiveToken) return null;
      const decoded = JSON.parse(atob(effectiveToken.split('.')[1]));
      return decoded.role === 'patient' ? decoded.id : null;
    } catch {
      return null;
    }
  })();

  const [reminders, setReminders] = useState([]);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminderMessage, setReminderMessage] = useState(
    medication ? `Take ${medication.name} (${medication.dosage || ''})` : ''
  );
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPlayingChime, setIsPlayingChime] = useState(false);

  const handleTestChime = () => {
    setIsPlayingChime(true);
    playAdherenceChime();
    setTimeout(() => setIsPlayingChime(false), 1400);
  };

  const fetchReminders = useCallback(async () => {
    if (!effectiveToken) {
      setError('Please log in to manage medication reminders.');
      setFetchLoading(false);
      return;
    }
    try {
      setFetchLoading(true);
      const res = await reminderService.getReminders(
        effectiveToken,
        effectivePatientId,
        medication ? medication.id : null
      );
      setReminders(res.data);
    } catch (err) {
      console.error(err);
      setError('Could not fetch existing reminders.');
    } finally {
      setFetchLoading(false);
    }
  }, [effectivePatientId, medication, effectiveToken]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!reminderTime) {
      setError('Please select a reminder time.');
      return;
    }
    if (!effectiveToken) {
      setError('Not authorized, session token missing. Please sign in again.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await reminderService.createReminder(
        {
          patient_id: effectivePatientId,
          medication_id: medication ? medication.id : null,
          reminder_time: reminderTime,
          reminder_message: reminderMessage || 'Medication reminder',
        },
        effectiveToken
      );

      setSuccess('Alarm / Reminder set successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchReminders();

      // Request browser notification permission if not yet granted
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to create reminder.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (reminderId) => {
    try {
      await reminderService.toggleReminder(reminderId, effectiveToken);
      setReminders(
        reminders.map((r) =>
          r.id === reminderId ? { ...r, is_active: !r.is_active } : r
        )
      );
    } catch (err) {
      console.error(err);
      alert('Failed to update reminder status.');
    }
  };

  const handleDelete = async (reminderId) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    try {
      await reminderService.deleteReminder(reminderId, effectiveToken);
      setReminders(reminders.filter((r) => r.id !== reminderId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete reminder.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content reminder-modal">
        <div className="reminder-modal-header">
          <div className="reminder-header-title">
            <FaBell className="reminder-bell-icon" />
            <div>
              <h3>Medication Reminder & Alarm</h3>
              <p className="reminder-subtitle">
                {medication
                  ? `For: ${medication.name} (${medication.dosage || ''})`
                  : 'Daily Medical Alarm'}
              </p>
            </div>
          </div>
          <button className="close-x-btn" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {error && <div className="modal-error-banner">{error}</div>}
        {success && <div className="modal-success-banner">{success}</div>}

        <form onSubmit={handleCreateReminder} className="reminder-form">
          <div className="reminder-form-row">
            <div className="time-input-group">
              <label htmlFor="reminder-time-input">
                <FaClock /> Reminder Time (Alarm)
              </label>
              <input
                id="reminder-time-input"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                required
              />
            </div>

            <div className="note-input-group">
              <label htmlFor="reminder-note-input">Reminder Note / Instruction</label>
              <input
                id="reminder-note-input"
                type="text"
                placeholder="e.g. Take 1 tablet with water after meal"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
              />
            </div>
          </div>

          <div className="acoustic-chime-test-bar">
            <button
              type="button"
              className="acoustic-test-btn"
              onClick={handleTestChime}
              title="Test browser harmonic Web Audio alarm chime"
            >
              <FaVolumeUp className="chime-btn-icon" /> Test Acoustic Chime (C5-E5-G5)
            </button>
            <div className={`acoustic-3bar-equalizer ${isPlayingChime ? 'is-dancing' : ''}`} aria-hidden="true">
              <span className="eq-bar bar-1" />
              <span className="eq-bar bar-2" />
              <span className="eq-bar bar-3" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="set-reminder-submit-btn">
            {loading ? 'Setting...' : 'Set Reminder Alarm'}
          </button>
        </form>

        <div className="active-reminders-section">
          <h4>Active Reminders & Alarms</h4>
          {fetchLoading ? (
            <p className="reminders-loading">Loading reminders...</p>
          ) : reminders.length === 0 ? (
            <p className="no-reminders-msg">No active reminders configured yet.</p>
          ) : (
            <ul className="reminders-list">
              {reminders.map((r) => (
                <li
                  key={r.id}
                  className={`reminder-item ${r.is_active ? 'active' : 'inactive'}`}
                >
                  <div className="reminder-item-time">
                    <span className="time-badge">{r.reminder_time}</span>
                  </div>
                  <div className="reminder-item-details">
                    <span className="reminder-text">{r.reminder_message}</span>
                    <span className="reminder-meta">
                      Set by {r.creator_name || 'User'}{' '}
                      {r.medication_name && `• ${r.medication_name}`}
                    </span>
                  </div>
                  <div className="reminder-item-actions">
                    <button
                      type="button"
                      className={`toggle-status-btn ${r.is_active ? 'btn-active' : 'btn-inactive'}`}
                      onClick={() => handleToggle(r.id)}
                      title={r.is_active ? 'Deactivate Alarm' : 'Activate Alarm'}
                    >
                      {r.is_active ? <FaCheck /> : <FaTimes />}
                      <span>{r.is_active ? 'Active' : 'Off'}</span>
                    </button>
                    <button
                      type="button"
                      className="delete-reminder-btn"
                      onClick={() => handleDelete(r.id)}
                      title="Delete Reminder"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
