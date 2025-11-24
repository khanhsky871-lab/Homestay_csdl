// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient'; // 1. Import file vừa tạo

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm giải mã JWT
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // 2. Cấu hình tự động Logout khi token hết hạn (401) tại đây
  useEffect(() => {
    const interceptor = axiosClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Chỉ logout nếu không phải đang ở trang login/register
          if (!window.location.pathname.includes('/auth')) {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );
    
    // Cleanup interceptor khi unmount
    return () => axiosClient.interceptors.response.eject(interceptor);
  }, []);

  // Kiểm tra token khi load lại trang
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser({
          username: decoded.sub || decoded.username,
          name: decoded.name || decoded.sub || "User",
          role: decoded.roles || []
        });
      } else {
        logout();
      }
    }
    setLoading(false);
  }, []);

  // --- ĐĂNG NHẬP ---
  const login = async (username, password) => {
    try {
      const payload = {
        username,
        password,
        platform: "WEB",
        deviceToken: "browser",
        versionApp: "1.0.0"
      };

      // Sử dụng axiosClient thay vì api.post cũ
      const res = await axiosClient.post('/auth/access-token', payload);

      if (res.data && res.data.accessToken) {
        const token = res.data.accessToken;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', res.data.refreshToken);

        const decoded = parseJwt(token);
        setUser({
          username: username,
          name: username,
          role: decoded ? decoded.roles : []
        });

        return { success: true };
      }
      return { success: false, message: 'Không nhận được access token.' };
    } catch (err) {
      console.error("Login error:", err);
      return {
        success: false,
        message: err.response?.data?.message || 'Đăng nhập thất bại.'
      };
    }
  };

  // --- ĐĂNG KÝ ---
  const register = async (name, email, password, username) => {
    try {
      const payload = {
        name,
        email,
        password,
        username,
        phone: "0000000000",
        identityCard: "000000000",
        gender: "Other",
        city: "Unknown",
        country: "Vietnam",
        address: "Unknown",
        roleId: 2 // Khách hàng
      };

      await axiosClient.post('/users', payload);
      return { success: true, message: 'Đăng ký thành công! Vui lòng đăng nhập.' };
    } catch (err) {
      console.error("Register error:", err);
      return {
        success: false,
        message: err.response?.data?.message || 'Đăng ký thất bại.'
      };
    }
  };

  // --- ĐĂNG XUẤT ---
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        api: axiosClient // Export axiosClient để các file khác (Home, Profile) dùng chung
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};