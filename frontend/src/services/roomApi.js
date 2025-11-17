// frontend/src/services/roomApi.js
const API_BASE_URL = 'http://localhost:8081/api/rooms'; // Endpoint Spring Boot

export const roomApi = {
    // READ (GET: Lấy tất cả)
    getRooms: async () => {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error('Không thể tải dữ liệu phòng');
            return await response.json();
        } catch (error) {
            console.error('Lỗi API GetRooms:', error);
            return [];
        }
    },
    
    // CREATE (POST: Thêm mới)
    addRoom: async (newRoom) => {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRoom),
        });
        if (!response.ok) throw new Error('Lỗi khi thêm phòng');
        return await response.json(); // Trả về đối tượng đã thêm (có ID)
    },

    // UPDATE (PUT: Cập nhật)
    updateRoom: async (updatedRoom) => {
        const response = await fetch(`${API_BASE_URL}/${updatedRoom.id}`, {
            method: 'PUT', // Hoặc PATCH tùy theo API Spring Boot của bạn
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedRoom),
        });
        if (!response.ok) throw new Error('Lỗi khi cập nhật phòng');
        return await response.json();
    },

    // DELETE (DELETE: Xóa)
    deleteRoom: async (id) => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Lỗi khi xóa phòng');
        return true; // Thành công
    },
};