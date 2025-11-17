import React, { useState, useEffect } from 'react';
import { roomApi } from '../services/roomApi';

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [formData, setFormData] = useState({ id: '', name: '', type: '', status: 'Trống' });

    // Hàm tải dữ liệu (Phải là ASYNC)
    const loadRooms = async () => {
        const data = await roomApi.getRooms();
        setRooms(data);
    };

    useEffect(() => {
        loadRooms();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => { // ASYNC
        e.preventDefault();
        try {
            if (formData.id) {
                await roomApi.updateRoom(formData);
            } else {
                await roomApi.addRoom(formData);
            }
            await loadRooms(); // Tải lại dữ liệu sau khi lưu
            setFormData({ id: '', name: '', type: '', status: 'Trống' }); // Reset form
        } catch (error) {
            alert('Lỗi khi lưu dữ liệu vào server: ' + error.message);
        }
    };

    const handleEdit = (room) => {
        setFormData(room);
    };

    const handleDelete = async (id) => { // ASYNC
        if (window.confirm(`Xác nhận xóa phòng ID ${id}?`)) {
            try {
                await roomApi.deleteRoom(id);
                await loadRooms(); // Tải lại danh sách
            } catch (error) {
                alert('Lỗi khi xóa dữ liệu: ' + error.message);
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>🛠️ Quản lý Phòng (Liên kết MySQL)</h2>
            
            {/* Form Thêm/Sửa */}
            <form onSubmit={handleSave} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
                <input type="hidden" name="id" value={formData.id} />
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Tên phòng" required />
                <input name="type" value={formData.type} onChange={handleChange} placeholder="Loại phòng" required />
                <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="Trống">Trống</option>
                    <option value="Đã thuê">Đã thuê</option>
                    <option value="Đang dọn dẹp">Đang dọn dẹp</option>
                </select>
                <button type="submit">{formData.id ? 'Cập nhật' : 'Thêm mới'}</button>
                {formData.id && <button type="button" onClick={() => setFormData({ id: '', name: '', type: '', status: 'Trống' })}>Hủy</button>}
            </form>

            {/* Bảng hiển thị */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr><th>ID</th><th>Tên Phòng</th><th>Loại</th><th>Trạng thái</th><th>Thao tác</th></tr>
                </thead>
                <tbody>
                    {rooms.map(room => (
                        <tr key={room.id}>
                            <td>{room.id}</td>
                            <td>{room.name}</td>
                            <td>{room.type}</td>
                            <td>{room.status}</td>
                            <td>
                                <button onClick={() => handleEdit(room)}>Sửa</button>
                                <button onClick={() => handleDelete(room.id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RoomManagement;