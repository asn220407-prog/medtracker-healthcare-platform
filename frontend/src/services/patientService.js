
import axios from 'axios';

import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/api/patient/`;

const getVitalTrackerData = (patient_id, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  return axios.get(API_URL + patient_id + '/vital-tracker', config);
};

const getProgressData = (patient_id, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  return axios.get(API_URL + patient_id + '/progress', config);
};

const patientService = {
  getVitalTrackerData,
  getProgressData,
};

export default patientService;
