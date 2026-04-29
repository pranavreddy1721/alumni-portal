import API from './api';

export const authService = {
  register: (data) => API.post('/auth/register', data),
  verifyEmail: (data) => API.post('/auth/verify-email', data),
  resendOTP: (data) => API.post('/auth/resend-otp', data),
  login: (data) => API.post('/auth/login', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  verifyResetOTP: (data) => API.post('/auth/verify-reset-otp', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
  getMe: () => API.get('/auth/me'),
};

export default authService;
