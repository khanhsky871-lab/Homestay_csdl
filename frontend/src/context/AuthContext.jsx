import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Tự động lấy lại thông tin khi F5
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Lỗi đọc user từ storage", e);
            }
        }
        setLoading(false);
    }, []);

    const api = axios.create({
        baseURL: 'http://localhost:8080',
    });

    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });
    
    // --- HÀM GIẢI MÃ TOKEN ĐỂ LẤY ROLE ---
    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };


    // 2. Hàm Login (ĐÃ SỬA LẠI ĐỂ NGĂN CHẶN DATA DÍNH)
    const login = async (username, password) => {
        try {
            const res = await axios.post('http://localhost:8080/auth/access-token', { username, password });
            
            if (res.data && res.data.accessToken) {
                const token = res.data.accessToken; 
                
                // 1. [QUAN TRỌNG] XÓA SẠCH TOKEN CŨ VÀ STATE CŨ TRƯỚC KHI LƯU MỚI
                localStorage.clear(); // Xóa mọi thứ
                setUser(null);
                
                // 2. Decode Token để lấy Role
                const decoded = parseJwt(token);
                const roleName = (decoded.scope || decoded.roles || "USER").toString(); // Lấy tên Role
                
                // 3. Tạo User Info (bao gồm cả RoleName)
                const userInfo = { 
                    name: username, 
                    username: username,
                    roles: roleName // <-- Lưu Role để kiểm tra khi chuyển hướng
                };

                // 4. Lưu Token và User Info mới
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userInfo));
                
                setUser(userInfo);
                return { success: true }; 
            }

            return { success: false, message: "Không nhận được token" };

        } catch (error) {
            console.error(error);
            return { success: false, message: error.response?.data?.message || "Lỗi đăng nhập" };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, api, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};