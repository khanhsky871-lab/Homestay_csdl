import React, { useState, useEffect } from 'react';
import { serviceApi } from '../services/serviceApi';

const ServiceManagement = () => {
    const [services, setServices] = useState([]);
    const [groups, setGroups] = useState([]);
    const [formData, setFormData] = useState({ id: '', group_id: 1, name: '', price: 0, status: 'active' });

    const loadData = async () => {
        try {
            setServices(await serviceApi.getServices());
            setGroups(await serviceApi.getGroups());
        } catch (error) {
            console.error(error);
            alert('Không thể tải dữ liệu Dịch vụ!');
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleChange = (e) => {
        let value = e.target.value;
        if (e.target.name === 'group_id' || e.target.name === 'price') value = Number(value);
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await serviceApi.addService(formData); 
            await loadData();
            setFormData({ id: '', group_id: groups[0]?.id || 1, name: '', price: 0, status: 'active' });
        } catch (error) {
            alert('Lỗi khi lưu Dịch vụ!');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(`Xác nhận xóa Dịch vụ ID ${id}?`)) {
            try {
                await serviceApi.deleteService(id);
                await loadData();
            } catch (error) {
                alert('Lỗi khi xóa Dịch vụ!');
            }
        }
    };

    const getGroupName = (groupId) => groups.find(g => g.id === groupId)?.name || 'N/A';

    return (
        <div style={{ padding: '20px' }}>
            <h2>🍽️ Quản lý Dịch vụ</h2>
            <form onSubmit={handleSave} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
                <select name="group_id" value={formData.group_id} onChange={handleChange} required>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Tên dịch vụ" required />
                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Giá" required />
                <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <button type="submit">Lưu Dịch vụ</button>
            </form>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th>ID</th><th>Tên Dịch vụ</th><th>Giá</th><th>Nhóm</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>
                    {services.map(service => (
                        <tr key={service.id}>
                            <td>{service.id}</td><td>{service.name}</td><td>${service.price?.toFixed(2)}</td>
                            <td>{getGroupName(service.group_id)}</td><td>{service.status}</td>
                            <td>
                                <button>Sửa</button>
                                <button onClick={() => handleDelete(service.id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ServiceManagement;