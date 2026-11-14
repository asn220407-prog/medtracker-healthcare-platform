import axios from 'axios';
import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/api/`;

const getLabReports = (patientId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  return axios.get(`${API_URL}patient/${patientId}/lab-reports`, config);
};

const uploadLabReport = (formData, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
      'Content-Type': 'multipart/form-data',
    },
  };
  return axios.post(`${API_URL}doctor/lab-reports`, formData, config);
};

const deleteLabReport = (reportId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  return axios.delete(`${API_URL}doctor/lab-reports/${reportId}`, config);
};

const labReportService = {
  getLabReports,
  uploadLabReport,
  deleteLabReport,
};

export default labReportService;
