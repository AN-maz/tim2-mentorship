import axiosClient from './axiosClient';

export const kuisService = {
  getKuisInfo: (id) => axiosClient.get(`/kuis/${id}`),
  getKuisSoal: (id) => axiosClient.get(`/kuis/${id}/soal`),
  submitKuis: (id, answers) => axiosClient.post(`/kuis/${id}/submit`, { answers }),

  // Creator
  getMyKuis: () => axiosClient.get('/kuis/my-kuis'),
  getKuisForEdit: (id) => axiosClient.get(`/kuis/${id}/edit`),
  createKuis: (data) => axiosClient.post('/kuis', data),
  updateKuis: (id, data) => axiosClient.put(`/kuis/${id}`, data),
  deleteKuis: (id) => axiosClient.delete(`/kuis/${id}`),
};