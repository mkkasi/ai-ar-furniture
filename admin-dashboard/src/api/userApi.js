import axiosClient from './axiosClient';

export const userApi = {
  list: (params) => axiosClient.get('/admin/users', { params }),
  toggleDisabled: (id, isDisabled) => axiosClient.put(`/admin/users/${id}/disable`, { isDisabled }),
};
