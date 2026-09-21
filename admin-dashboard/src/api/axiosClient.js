import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the stored admin JWT to every request.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, notify the app to clear the session and bounce to /login.
// A guard flag stops duplicate redirects if several in-flight requests
// all 401 around the same time (e.g. a batch of dashboard widgets).
let sessionExpiredHandled = false;

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !sessionExpiredHandled) {
      sessionExpiredHandled = true;
      window.dispatchEvent(new Event('auth:session-expired'));
      // Reset the guard shortly after so a *later*, unrelated session
      // expiry (not just this burst of requests) can still be handled.
      setTimeout(() => {
        sessionExpiredHandled = false;
      }, 2000);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
