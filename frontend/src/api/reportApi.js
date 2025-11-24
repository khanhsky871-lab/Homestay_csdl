import axiosClient from "./axiosClient";

/*
 Backend KHÔNG có /reports/**
 => Phải lấy dữ liệu gốc rồi xử lý ở frontend
*/

// 1. Hóa đơn – tính doanh thu
export const getBills = () => {
  return axiosClient.get("/bills");
};

// 2. Lịch sử đặt phòng
export const getReservations = () => {
  return axiosClient.get("/reservations");
};

// 3. Danh sách phòng
export const getRooms = () => {
  return axiosClient.get("/rooms");
};

// 4. Danh sách người dùng / nhân viên
export const getUsers = () => {
  return axiosClient.get("/users");
};

// 5. Danh sách dịch vụ
export const getServices = () => {
  return axiosClient.get("/services");
};
