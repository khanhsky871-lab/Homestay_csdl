// src/context/AuthContext.js
import React, { createContext, useState } from 'react';

// Tạo Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. TRẠNG THÁI USER: Mặc định là null (Chưa đăng nhập)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2. DATA GIẢ LẬP (Mock Database)
  
  // Danh sách phòng (Dùng cho HomeSlider)
  const mockRooms = [
    { 
      id: 1, 
      name: "Deluxe Ocean View", 
      price: 120, 
      status: "Available", 
      capacity: 2, 
      area: 45, 
      description: "Phòng view biển tuyệt đẹp, thích hợp cho cặp đôi.",
      images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"] 
    },
    { 
      id: 2, 
      name: "Standard King Room", 
      price: 80, 
      status: "Occupied", 
      capacity: 2, 
      area: 30, 
      description: "Phòng tiêu chuẩn, đầy đủ tiện nghi.",
      images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop"] 
    },
    { 
      id: 3, 
      name: "Family Suite", 
      price: 200, 
      status: "Available", 
      capacity: 4, 
      area: 80, 
      description: "Căn hộ rộng rãi cho gia đình 4 người.",
      images: ["https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800&auto=format&fit=crop"] 
    },
    { 
      id: 4, 
      name: "Single Budget", 
      price: 45, 
      status: "Cleaning", 
      capacity: 1, 
      area: 20, 
      description: "Phòng đơn tiết kiệm cho người đi công tác.",
      images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800&auto=format&fit=crop"] 
    },
    { 
      id: 5, 
      name: "Luxury Penthouse", 
      price: 350, 
      status: "Maintenance", 
      capacity: 6, 
      area: 150, 
      description: "Đẳng cấp thượng lưu với hồ bơi riêng.",
      images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop"] 
    }
  ];

  // Danh sách đặt phòng (Lưu trữ trong State để khi đặt xong nó cập nhật ngay)
  const [mockReservations, setMockReservations] = useState([
    {
      id: 101,
      roomId: 1,
      roomName: "Deluxe Ocean View",
      checkInDate: "2024-05-01T14:00:00",
      checkOutDate: "2024-05-03T12:00:00",
      total: 240,
      status: "Confirmed",
      paymentStatus: "Paid" // Có trạng thái thanh toán
    },
    {
      id: 102,
      roomId: 2,
      roomName: "Standard King Room",
      checkInDate: "2024-06-10T14:00:00",
      checkOutDate: "2024-06-12T12:00:00",
      total: 160,
      status: "Cancelled",
      paymentStatus: "Refunded"
    }
  ]);

  // 3. MOCK API (Giả lập Axios)
  const api = {
    // --- XỬ LÝ GET REQUEST ---
    get: async (url) => {
      console.log(`[MOCK GET] ${url}`);
      return new Promise((resolve) => {
        setTimeout(() => {
          
          // A. Lấy danh sách phòng (HomeSlider)
          if (url.includes('/rooms')) {
            resolve({
              data: {
                success: true,
                content: mockRooms, // Swagger: PageRoomResponse
                data: { content: mockRooms } // Fallback
              }
            });
          } 
          
          // B. Lấy lịch sử đặt phòng (ProfilePage)
          else if (url.includes('/reservations')) {
            resolve({
              data: {
                success: true,
                content: mockReservations, // Trả về state mới nhất
                data: { content: mockReservations }
              }
            });
          } 
          
          // C. Lấy hóa đơn (ProfilePage)
          else if (url.includes('/bills')) {
            resolve({
              data: {
                success: true,
                data: [
                  { id: 501, reservationId: 101, createdAt: "2024-05-03T10:00:00", total: 240 }
                ]
              }
            });
          }
          
          else {
            resolve({ data: { success: true, data: [] } });
          }
        }, 500); // Delay 0.5s
      });
    },

    // --- XỬ LÝ POST REQUEST (QUAN TRỌNG) ---
    post: async (url, payload) => {
      console.log(`[MOCK POST] ${url}`, payload);
      return new Promise((resolve) => {
        setTimeout(() => {
          
          // A. Đăng nhập
          if (url.includes('/auth/access-token')) {
            resolve({
              data: {
                accessToken: "fake-token-123",
                refreshToken: "fake-refresh-123"
              }
            });
          }

          // B. Đặt phòng (HomeSlider gọi)
          else if (url.includes('/reservations')) {
            // 1. Tìm thông tin phòng để lấy tên và giá
            const roomInfo = mockRooms.find(r => r.id === payload.roomId);
            const pricePerNight = roomInfo ? roomInfo.price : 100;
            const rName = roomInfo ? roomInfo.name : "Unknown Room";

            // 2. Tính tổng tiền dựa trên ngày
            const start = new Date(payload.checkInDate);
            const end = new Date(payload.checkOutDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            const totalCalc = diffDays * pricePerNight;

            // 3. Tạo đơn mới
            const newBooking = {
              id: Math.floor(Math.random() * 10000) + 1000, // ID ngẫu nhiên
              roomId: payload.roomId,
              roomName: rName,
              checkInDate: payload.checkInDate,
              checkOutDate: payload.checkOutDate,
              total: totalCalc > 0 ? totalCalc : pricePerNight, // Fallback nếu tính lỗi
              status: "Pending", // Trạng thái đơn: Chờ xử lý
              paymentStatus: "Unpaid", // Trạng thái thanh toán: Chưa thanh toán
              numGuests: payload.numGuests
            };

            // 4. Cập nhật vào "Database" giả
            setMockReservations(prev => [newBooking, ...prev]);

            resolve({
              data: {
                success: true,
                message: "Đặt phòng thành công!",
                data: newBooking
              }
            });
          }
          
          // C. Đăng ký
          else if (url.includes('/users')) {
             resolve({ data: { success: true, message: "Đăng ký thành công" } });
          }

          else {
            resolve({ data: { success: true } });
          }
        }, 800); // Delay 0.8s
      });
    },

    // Mock interceptors
    interceptors: {
        request: { use: () => {} },
        response: { use: () => {} }
    }
  };

  // --- HÀM LOGIN GIẢ ---
  // Chấp nhận cả username hoặc email
  const login = async (identifier, password) => {
    // Giả lập gọi API
    await api.post('/auth/access-token', { username: identifier, password });
    
    // Set User giả vào state
    const fakeUser = {
        id: 123,
        username: identifier.includes('@') ? identifier.split('@')[0] : identifier,
        name: "Nguyễn Văn Test",
        email: identifier.includes('@') ? identifier : `${identifier}@gmail.com`,
        role: "CUSTOMER"
    };
    setUser(fakeUser);
    localStorage.setItem('token', 'fake-jwt-token');
    
    return { success: true };
  };

  const register = async () => {
    return { success: true, message: 'Đăng ký giả lập thành công!' };
  };

  const logout = () => {
    localStorage.removeItem('token');
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
        api 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};