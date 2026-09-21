import axiosClient from './axiosClient';

export const notificationApi = {
  create: (payload) => axiosClient.post('/notifications', payload),
};
