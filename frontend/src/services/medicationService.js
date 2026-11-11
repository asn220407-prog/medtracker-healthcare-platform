
import axios from 'axios';
import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/api/medications/`;

const addMedication = (medicationData, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  return axios.post(API_URL, medicationData, config);
};

const updateMedication = (medication_id, medicationData, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  return axios.put(API_URL + medication_id, medicationData, config);
};

const deleteMedication = (medication_id, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  return axios.delete(API_URL + medication_id, config);
};

const medicationService = {
  addMedication,
  updateMedication,
  deleteMedication,
};

export default medicationService;
