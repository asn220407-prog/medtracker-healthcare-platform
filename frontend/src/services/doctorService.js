
import axios from 'axios';

import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/api/doctor/`;

const getDashboard = (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return axios.get(API_URL + 'dashboard', config);
};

const updatePatient = (patient_id, patientData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return axios.put(API_URL + 'patients/' + patient_id, patientData, config);
};

const deletePatient = (patient_id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return axios.delete(API_URL + 'patients/' + patient_id, config);
};

const addAppointment = (appointmentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return axios.post(API_URL + 'appointments', appointmentData, config);
};

const doctorService = {
  getDashboard,
  updatePatient,
  deletePatient,
  addAppointment,
};

export default doctorService;
