import axiosClient from './axiosClient';

export const materiService = {
  // Public & Learner (UC-03, UC-04, UC-05, UC-06, UC-07)
  getAllMateri: (params) => axiosClient.get('/materi', { params }),
  getMateriById: (id) => axiosClient.get(`/materi/${id}`),
  searchMateri: (keyword) => axiosClient.get('/materi/search', { params: { q: keyword } }),
  giveRating: (data) => axiosClient.post('/rating', data),
  updateRating: (data) => axiosClient.post('/rating/update', data),
  addComment: (data) => axiosClient.post('/komentar', data),
  editComment: (id, data) => axiosClient.put(`/komentar/${id}`, data),
  deleteComment: (id) => axiosClient.delete(`/komentar/${id}`),
  completeMateri: (data) => axiosClient.post('/riwayat-belajar/complete', data),

  // Creator (UC-10)
  getMyMateri: () => axiosClient.get('/materi/my-materi'),
  getMateriForEdit: (id) => axiosClient.get(`/materi/${id}/edit`),
  createMateri: (data) => axiosClient.post('/materi', data),
  updateMateri: (id, data) => axiosClient.put(`/materi/${id}`, data),
  deleteMateri: (id) => axiosClient.delete(`/materi/${id}`),
};