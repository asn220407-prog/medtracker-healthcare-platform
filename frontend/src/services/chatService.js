import axios from 'axios';
import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/api/chat`;

const getMessages = (patientId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  return axios.get(`${API_URL}/${patientId}`, config);
};

const sendMessage = (patientId, messageText, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  return axios.post(`${API_URL}/${patientId}`, { message_text: messageText }, config);
};

const chatService = {
  getMessages,
  sendMessage,
};

export default chatService;
