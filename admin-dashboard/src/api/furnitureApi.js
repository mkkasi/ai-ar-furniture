import axiosClient from './axiosClient';

export const furnitureApi = {
  list: (params) => axiosClient.get('/furniture', { params }),
  get: (id) => axiosClient.get(`/furniture/${id}`),
  create: (formData) =>
    axiosClient.post('/furniture', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    axiosClient.put(`/furniture/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadModel: (id, formData) =>
    axiosClient.put(`/furniture/${id}/model`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => axiosClient.delete(`/furniture/${id}`),
  removeImage: (id, publicId) => axiosClient.delete(`/furniture/${id}/images/${publicId}`),
};
