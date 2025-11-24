import axiosClient from "./axiosClient";

// 1. Lấy danh sách hóa đơn
export const getAllBills = () => {
  return axiosClient.get("/bills");
};

// 2. Tạo hóa đơn từ reservation
export const createBill = (data) => {
  return axiosClient.post("/bills", data);
};

// 3. Lấy chi tiết hóa đơn
export const getBillDetail = (billId) => {
  return axiosClient.get(`/bills/${billId}/details`);
};

// 4. Thêm dịch vụ vào hóa đơn
export const addBillDetail = (billId, data) => {
  return axiosClient.post(`/bills/${billId}/details`, data);
};
