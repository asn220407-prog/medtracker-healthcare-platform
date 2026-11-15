import React, { useState, useEffect, useRef } from 'react';
import reminderService from '../services/reminderService';
import { FaBell, FaTimes, FaCheckCircle } from 'react-icons/fa';
import './ReminderAlarmBanner.css';

// Pleasant Web Audio synth chime
const playAlarmSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq, delay, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    };

    playTone(523.25, 0, 0.25); // C5
    playTone(659.25, 0.15, 0.25); // E5
    playTone(783.99, 0.3, 0.35); // G5
  } catch (e) {
    console.log('Audio playback prevented or unsupported:', e);
  }
};

const ReminderAlarmBanner = ({ token }) => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const lastAlertedTimes = useRef(new Set());

  useEffect(() => {
    if (!token) return;

    // Request notification permission once
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkAlarms = async () => {
      try {
        const res = await reminderService.getReminders(token);
        const reminders = res.data.filter((r) => r.is_active);

        const now = new Date();
        const currentHHMM = now.toTimeString().slice(0, 5); // "HH:MM"
        const currentKey = `${currentHHMM}-${now.toDateString()}`;

        reminders.forEach((r) => {
          const reminderKey = `${r.id}-${currentKey}`;
          if (r.reminder_time === currentHHMM && !lastAlertedTimes.current.has(reminderKey)) {
            lastAlertedTimes.current.add(reminderKey);

            // Play Web Audio Chime
            playAlarmSound();

            // Trigger Desktop Notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification('⏰ Medication Alarm Reminder', {
                  body: r.reminder_message || 'Time to take your scheduled medication.',
                  icon: '/favicon.ico',
                });
              } catch (e) {
                console.log(e);
              }
            }

            // Add to in-app banner alert list
            setActiveAlerts((prev) => [
              ...prev,
              {
                id: r.id,
                time: r.reminder_time,
                message: r.reminder_message || 'Time to take your scheduled medication.',
                medicationName: r.medication_name,
                key: reminderKey,
              },
            ]);
          }
        });
      } catch (err) {
        // Silently skip if network error
      }
    };

    // Run check immediately, then every 20 seconds
    checkAlarms();
    const interval = setInterval(checkAlarms, 20000);

    return () => clearInterval(interval);
  }, [token]);

  const dismissAlert = (key) => {
    setActiveAlerts((prev) => prev.filter((a) => a.key !== key));
  };

  if (activeAlerts.length === 0) return null;

  return (
    <div className="alarm-banner-container">
      {activeAlerts.map((alert) => (
        <div key={alert.key} className="alarm-banner-toast">
          <div className="alarm-toast-icon">
            <FaBell className="alarm-ring-animation" />
          </div>
          <div className="alarm-toast-content">
            <div className="alarm-toast-header">
              <span className="alarm-toast-tag">ALARM {alert.time}</span>
              {alert.medicationName && (
                <span className="alarm-med-tag">{alert.medicationName}</span>
              )}
            </div>
            <p className="alarm-toast-msg">{alert.message}</p>
          </div>
          <div className="alarm-toast-actions">
            <button
              className="alarm-dismiss-btn"
              onClick={() => dismissAlert(alert.key)}
              title="Acknowledge Alarm"
            >
              <FaCheckCircle /> Dismiss
            </button>
            <button
              className="alarm-close-btn"
              onClick={() => dismissAlert(alert.key)}
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReminderAlarmBanner;
