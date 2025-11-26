import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pages/AdminDashboard.css'; // Tận dụng lại CSS của Admin

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState([]);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // --- [FIX] Thêm loading state ---

    const token = localStorage.getItem('token');
    const API_BASE_URL = 'http://localhost:8080';
    
    // --- HELPER FUNCTIONS (Đã xóa ở bước trước, nay thêm lại) ---
    const formatDate = (dateString) => {
        if (!dateString) return "---";
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    useEffect(() => {
        if (!token) { navigate('/auth'); return; }
        // Gọi cả 2 hàm tải dữ liệu
        fetchMyInfo();
        fetchMySchedules();
        // Đã bỏ Dependency List để fix lỗi Warning
    }, [navigate, token]); 

    const fetchMyInfo = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/users/my-info`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data.data || res.data.result);
        } catch (e) { 
            console.error("Lỗi tải thông tin User:", e); 
            // Nếu lỗi, nên logout để tránh lỗi dính data
            localStorage.clear();
            navigate('/auth');
        } 
    };

    const fetchMySchedules = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/schedules/my-schedule`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSchedules(res.data.data || []);
        } catch (e) { 
            console.error("Lỗi tải lịch làm việc:", e); 
        } finally {
            setIsLoading(false); // --- [FIX] Kết thúc tải dữ liệu ---
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/auth');
    };

    // --- RENDER CHECK ---
    if (isLoading) {
        return <div className="loading-screen" style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}}>Đang tải lịch làm việc...</div>;
    }
    
    // Nếu không có user (sau khi load)
    if (!user) {
        return <div className="loading-screen" style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}}>Không tìm thấy thông tin nhân viên.</div>;
    }

    return (
        <div className="admin-container">
            {/* SIDEBAR ĐƠN GIẢN CHO NHÂN VIÊN */}
            <div className="sidebar" style={{backgroundColor: '#2c3e50'}}>
                <h2 style={{color:'white'}}>Staff Panel</h2>
                <ul>
                    <li className="active">📅 Lịch làm việc của tôi</li>
                    <li onClick={handleLogout} style={{color: '#ff6b6b', marginTop: 'auto', cursor:'pointer'}}>Đăng xuất</li>
                </ul>
            </div>

            <div className="main-content">
                <h1 style={{borderBottom:'2px solid #52c41a', paddingBottom:'10px'}}>Xin chào, {user?.name} 👋</h1>
                <p style={{fontSize:'14px', color:'#555'}}>Đây là lịch làm việc được phân công cho bạn.</p>

                <div className="table-responsive" style={{marginTop:'30px'}}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Ngày làm</th>
                                <th>Ca làm việc</th>
                                <th>Nhiệm vụ (Task)</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.length > 0 ? (
                                schedules.map(s => (
                                    <tr key={s.id}>
                                        <td style={{fontWeight:'bold', color:'#333'}}>
                                            {formatDate(s.workDate)}
                                        </td>
                                        <td style={{color:'#008080', fontWeight:'bold'}}>
                                            {s.startTime} - {s.endTime}
                                        </td>
                                        <td>{s.task}</td>
                                        <td>
                                            <span className="status-badge" 
                                                  style={{
                                                      padding: '5px 10px', 
                                                      borderRadius: '4px',
                                                      backgroundColor: s.status === 'ASSIGNED' ? '#e6f7ff' : '#f6ffed',
                                                      color: s.status === 'ASSIGNED' ? '#1890ff' : '#52c41a'
                                                  }}>
                                                {s.status === 'ASSIGNED' ? 'Được giao' : s.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="empty-text">Bạn chưa có lịch làm việc nào được phân công.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;