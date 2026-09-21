import axiosClient from './axiosClient';

export const authApi = {
  login: (email, password) => axiosClient.post('/auth/login', { email, password }),
  profile: () => axiosClient.get('/auth/profile'),
  logout: () => axiosClient.post('/auth/logout'),
};
