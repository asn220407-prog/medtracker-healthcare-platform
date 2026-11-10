// Central API configuration
// In production (Railway), REACT_APP_API_URL is set to the backend's public Railway URL.
// In local development, it falls back to http://localhost:5000.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default API_BASE_URL;
