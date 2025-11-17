import React, { useState, useEffect } from 'react';
import { customerApi } from '../services/customerApi';

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({ id: '', name: '', phone: '' });

    const loadCustomers = async () => {
        try {
            setCustomers(await customerApi.getCustomers());
        } catch (error) {
            console.error(error);
            alert('Không thể tải dữ liệu Khách hàng!');
        }
    };

    useEffect(() => { loadCustomers(); }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // Giả định chỉ Thêm mới, cần triển khai updateCustomer trong Service
            formData.id ? {} : await customerApi.addCustomer(formData);
            await loadCustomers();
            setFormData({ id: '', name: '', phone: '' });
        } catch (error) {
            alert('Lỗi khi lưu dữ liệu Khách hàng!');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(`Xác nhận xóa Khách hàng ID ${id}?`)) {
            try {
                await customerApi.deleteCustomer(id);
                await loadCustomers();
            } catch (error) {
                alert('Lỗi khi xóa dữ liệu Khách hàng!');
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>👥 Quản lý Khách hàng</h2>
            <form onSubmit={handleSave} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
                <input type="hidden" name="id" value={formData.id} />
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Tên khách hàng" required />
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Điện thoại" required />
                <button type="submit">{formData.id ? 'Cập nhật' : 'Thêm mới'}</button>
            </form>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th>ID</th><th>Tên Khách</th><th>Điện thoại</th><th>Thao tác</th></tr></thead>
                <tbody>
                    {customers.map(customer => (
                        <tr key={customer.id}>
                            <td>{customer.id}</td><td>{customer.name}</td><td>{customer.phone}</td>
                            <td>
                                <button onClick={() => setFormData(customer)}>Sửa</button>
                                <button onClick={() => handleDelete(customer.id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CustomerManagement;