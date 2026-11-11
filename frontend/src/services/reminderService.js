import axios from 'axios';
import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/api/reminders`;

const getAuthConfig = (token, extraParams = {}) => {
  const effectiveToken = token || localStorage.getItem('token');
  const headers = {};
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
    headers['x-auth-token'] = effectiveToken;
  }
  return {
    headers,
    params: extraParams,
    withCredentials: true,
  };
};

const getReminders = (token, patientId = null, medicationId = null) => {
  const params = {};
  if (patientId) params.patient_id = patientId;
  if (medicationId) params.medication_id = medicationId;

  return axios.get(API_URL, getAuthConfig(token, params));
};

const createReminder = (reminderData, token) => {
  return axios.post(API_URL, reminderData, getAuthConfig(token));
};

const deleteReminder = (reminderId, token) => {
  return axios.delete(`${API_URL}/${reminderId}`, getAuthConfig(token));
};

const toggleReminder = (reminderId, token) => {
  return axios.put(`${API_URL}/${reminderId}/toggle`, {}, getAuthConfig(token));
};

const reminderService = {
  getReminders,
  createReminder,
  deleteReminder,
  toggleReminder,
};

export default reminderService;
