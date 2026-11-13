import API_BASE_URL from '../config';
const API_URL = `${API_BASE_URL}/api/adherence`;

const getAdherence = async (medicationId, token) => {
  const response = await fetch(`${API_URL}/${medicationId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
  });
  return response.json();
};

const tickCalendar = async (medicationId, date, token, patientId = null) => {
  const response = await fetch(`${API_URL}/tick`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
    body: JSON.stringify({ medication_id: medicationId, date, patient_id: patientId }),
  });
  return response.json();
};

const untickCalendar = async (medicationId, date, token, patientId = null) => {
  const response = await fetch(`${API_URL}/untick`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
    body: JSON.stringify({ medication_id: medicationId, date, patient_id: patientId }),
  });
  return response.json();
};

const getPatientAdherence = async (patientId, medicationId, token) => {
  const response = await fetch(`${API_URL}/patient/${patientId}/${medicationId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
  });
  return response.json();
};

const adherenceService = {
  getAdherence,
  tickCalendar,
  untickCalendar,
  getPatientAdherence,
};

export default adherenceService;
