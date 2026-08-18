import axiosClient from './axiosClient';

export const authService = {
  // API-001: Login Manual
  login: async (email, password) => {
    return await axiosClient.post('/auth/login', { email, password });
  },

  // API-002: Google Login
  googleLogin: async (googleToken) => {
    return await axiosClient.post('/auth/google-login', { token: googleToken });
  },

  // API-003: Register Manual
  register: async (payload) => {
    return await axiosClient.post('/auth/register', payload);
  }
};