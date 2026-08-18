import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:2026/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response && error.response?.status === 401) {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_data');
            window.location.href = '/auth';
        }
        return Promise.reject(error.response?.data || error.message);
    }
);

export default axiosClient;