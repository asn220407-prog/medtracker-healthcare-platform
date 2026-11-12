
import axios from 'axios';
import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/api/health-tips/`;

const addHealthTip = (healthTipData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return axios.post(API_URL, healthTipData, config);
};

const updateHealthTip = (tip_id, healthTipData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return axios.put(API_URL + tip_id, healthTipData, config);
};

const deleteHealthTip = (tip_id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return axios.delete(API_URL + tip_id, config);
};

const healthTipService = {
  addHealthTip,
  updateHealthTip,
  deleteHealthTip,
};

export default healthTipService;
