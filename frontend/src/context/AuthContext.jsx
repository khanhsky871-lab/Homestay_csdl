// src/context/AuthContext.js
import React, { createContext, useState } from 'react';

// Tạo Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. GIẢ LẬP ĐĂNG NHẬP: Gán luôn thông tin user để test
  const [user, setUser] = useState({ 
    id: 999,
    username: "testuser", 
    name: "Khách hàng Test", 
    role: "CUSTOMER",
    email: "test@example.com"
  });
  
  const [loading, setLoading] = useState(false);

  // 2. GIẢ LẬP API (Mock API Object)
  // Object này thay thế cho axios để trả về dữ liệu giả mà không cần Backend
  const api = {
    // Giả lập POST (Dùng cho Đăng nhập, Đăng ký, Đặt phòng)
    post: async (url, payload) => {
      console.log(`[MOCK API] POST đến: ${url}`);
      console.log(`[MOCK API] Payload:`, payload);

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              success: true,
              message: "Mock API: Thao tác thành công!",
              // Trả về lại dữ liệu đã gửi kèm ID ngẫu nhiên
              data: { ...payload, id: Math.floor(Math.random() * 10000) } 
            }
          });
        }, 800); // Delay 0.8s giả lập mạng
      });
    },
    
    // Giả lập GET (Dùng cho lấy danh sách phòng, lịch sử, hóa đơn)
    get: async (url) => {
       console.log(`[MOCK API] GET: ${url}`);
       
       return new Promise((resolve) => {
         setTimeout(() => {
            // --- MOCK DATA CHO TRANG CÁ NHÂN ---
            
            // 1. Dữ liệu Lịch sử đặt phòng
            if (url === '/reservations') {
              resolve({
                data: {
                  success: true,
                  data: {
                    // Giả lập cấu trúc phân trang của Swagger (content)
                    content: [
                      {
                        id: 101,
                        roomName: "Deluxe Ocean View",
                        checkInDate: "2024-05-01T14:00:00",
                        checkOutDate: "2024-05-03T12:00:00",
                        total: 240,
                        status: "Confirmed"
                      },
                      {
                        id: 102,
                        roomName: "Standard King Room",
                        checkInDate: "2024-06-10T14:00:00",
                        checkOutDate: "2024-06-11T12:00:00",
                        total: 80,
                        status: "Cancelled"
                      },
                      {
                        id: 103,
                        roomName: "Family Suite",
                        checkInDate: "2024-07-20T14:00:00",
                        checkOutDate: "2024-07-25T12:00:00",
                        total: 1000,
                        status: "Pending"
                      }
                    ]
                  }
                }
              });
            } 
            // 2. Dữ liệu Hóa đơn
            else if (url === '/bills') {
              resolve({
                data: {
                  success: true,
                  data: [
                    {
                      id: 501,
                      reservationId: 101,
                      createdAt: "2024-05-03T10:00:00",
                      total: 240
                    },
                    {
                      id: 502,
                      reservationId: 105,
                      createdAt: "2024-08-15T09:30:00",
                      total: 150
                    }
                  ]
                }
              });
            }
            // 3. Dữ liệu Danh sách phòng (Trang chủ)
            else if (url.includes('/rooms')) {
               // Nếu HomePage gọi API lấy phòng, trả về success để không lỗi
               // (HomePage hiện đang dùng biến rooms cứng nên cái này chỉ dự phòng)
               resolve({ data: { success: true, data: { content: [] } } });
            }
            // Mặc định trả về rỗng
            else {
              resolve({ data: { success: true, data: [] } });
            }
         }, 500); 
       });
    },

    // Mock interceptors để code cũ không bị crash
    interceptors: {
        request: { use: () => {} },
        response: { use: () => {} }
    }
  };

  // --- CÁC HÀM AUTH GIẢ ---
  const login = async (username, password) => {
    console.log("Fake Login:", username);
    // Khi login thật thì set user có tên
    setUser({ 
        id: 123, 
        username: username, 
        name: username === 'admin' ? 'Administrator' : 'Khách hàng Demo', 
        role: "CUSTOMER",
        email: `${username}@gmail.com`
    });
    return { success: true };
  };

  const register = async (name, email, password, username) => {
    console.log("Fake Register:", { name, email, username });
    return { success: true, message: "Đăng ký thành công (Mock)" };
  };

  const logout = () => {
    console.log("Logout called");
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
        api // Export api giả để dùng ở các trang
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};