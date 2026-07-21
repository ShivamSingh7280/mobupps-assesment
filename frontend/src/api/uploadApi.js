import axiosClient from './axiosClient';

export const uploadApi = {
  getSignature: () => axiosClient.post('/uploads/signature'),
};
