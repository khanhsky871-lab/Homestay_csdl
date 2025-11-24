// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080', // Cổng Backend của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor Request: Tự động gắn Token ---
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Interceptor Response: Xử lý dữ liệu trả về hoặc lỗi ---
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về toàn bộ response để các file khác có thể check .status hoặc .data
    return response;
  },
  (error) => {
    // Xử lý lỗi chung (ví dụ log ra console)
    if (error.response) {
      console.error(`Error API: ${error.response.status} - ${error.response.data?.message}`);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;