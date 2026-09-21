import axiosClient from './axiosClient';

export const statsApi = {
  dashboard: () => axiosClient.get('/admin/stats'),
  savedDesigns: () => axiosClient.get('/admin/saved-designs'),
  reviews: () => axiosClient.get('/admin/reviews'),
  deleteReview: (id) => axiosClient.delete(`/admin/reviews/${id}`),
};
