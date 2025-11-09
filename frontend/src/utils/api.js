import axios from 'axios';

// Create an instance of axios
const api = axios.create({
  baseURL: '/api', // This will use the proxy defined in package.json
  headers: {
    'Content-Type': 'application/json',
  },
});

/*
  Add a request interceptor to include the token in every request
  This is an alternative to setting it on login, in case the app reloads
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;