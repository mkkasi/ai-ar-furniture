import axiosClient from './axiosClient';

export const categoryApi = {
  list: () => axiosClient.get('/categories', { params: { includeInactive: true } }),
  create: (formData) =>
    axiosClient.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    axiosClient.put(`/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => axiosClient.delete(`/categories/${id}`),
};
