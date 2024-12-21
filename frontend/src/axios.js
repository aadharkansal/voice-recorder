import axios from 'axios';

// Use the environment variable to set the base URL
const baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
