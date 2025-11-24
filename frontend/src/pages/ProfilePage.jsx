// src/pages/ProfilePage.js
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, logout, loading, isAuthenticated, api } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('info'); // 'info', 'history', 'bills'
  const [reservations, setReservations] = useState([]);
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState({ totalSpent: 0, totalBookings: 0 });
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Bảo vệ route: Chưa login thì đẩy về /auth
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  // Gọi API lấy dữ liệu khi user đã load xong
  useEffect(() => {
    if (user) {
      fetchData();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      // 1. Lấy lịch sử đặt phòng
      // API trả về PageReservationResponse -> Dữ liệu nằm trong .content
      const resReservations = await api.get('/reservations?page=0&size=100&sortDirection=DESC');
      // Fallback an toàn: kiểm tra res.data.content hoặc res.data.data.content
      const reservationList = resReservations.data?.content || resReservations.data?.data?.content || []; 
      setReservations(reservationList);

      // 2. Lấy hóa đơn
      // API trả về ApiResponseListBillResponse -> Dữ liệu nằm trong .data
      const resBills = await api.get('/bills');
      const billList = resBills.data?.data || [];
      setBills(billList);

      // 3. Tính toán thống kê
      const totalMoney = billList.reduce((acc, curr) => acc + (curr.total || 0), 0);
      setStats({
        totalSpent: totalMoney,
        totalBookings: reservationList.length
      });

    } catch (error) {
      console.error("Lỗi tải dữ liệu profile:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Hàm format ngày
  const formatDate = (dateString) => {
    if(!dateString) return "";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) return <div className="loading-screen">Loading...</div>;
  
  // Nếu user chưa load xong hoặc bị null thì không render để tránh lỗi
  if (!user) return null;

  // Render nội dung từng Tab
  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="tab-content info-tab">
            <div className="detail-item">
              <label>Họ và tên:</label>
              <span>{user.name || user.username}</span>
            </div>
            <div className="detail-item">
              <label>Tên đăng nhập:</label>
              <span>{user.username}</span>
            </div>
            <div className="detail-item">
              <label>Email:</label>
              <span>{user.email || 'Chưa cập nhật'}</span>
            </div>
             <div className="detail-item">
              <label>Vai trò:</label>
              {/* Xử lý hiển thị role an toàn */}
              <span>{Array.isArray(user.role) ? user.role[0]?.authority || 'Customer' : (user.role || 'Customer')}</span>
            </div>
            {/* <div className="detail-item">
              <label>Trạng thái:</label>
              <span className="status-badge active">Hoạt động</span>
            </div> */}
          </div>
        );

      case 'history':
        return (
          <div className="tab-content history-tab">
            {reservations.length === 0 ? (
              <p className="empty-state">Bạn chưa có lịch sử đặt phòng nào.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Phòng</th>
                      <th>Ngày nhận</th>
                      <th>Ngày trả</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td>{item.roomName || `Phòng ${item.roomId}`}</td>
                        <td>{formatDate(item.checkInDate)}</td>
                        <td>{formatDate(item.checkOutDate)}</td>
                        <td style={{fontWeight: 'bold', color: '#008080'}}>${item.total}</td>
                        <td>
                          <span className={`status-badge ${item.status?.toLowerCase()}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'bills':
        return (
          <div className="tab-content bills-tab">
             {bills.length === 0 ? (
              <p className="empty-state">Chưa có hóa đơn nào.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mã HĐ</th>
                      <th>Mã Đặt Phòng</th>
                      <th>Ngày tạo</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill.id}>
                        <td>#{bill.id}</td>
                        <td>#{bill.reservationId}</td>
                        <td>{formatDate(bill.createdAt)}</td>
                        <td className="price-text">${bill.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-layout">
        {/* SIDEBAR TRÁI */}
        <div className="profile-sidebar">
          <div className="profile-header">
            <div className="avatar-circle">
              {/* Lấy ký tự đầu của tên, xử lý an toàn nếu name null */}
              {(user.name || user.username || "U").charAt(0).toUpperCase()}
            </div>
            <h3>{user.name || user.username}</h3>
            <p className="user-role">Khách hàng thân thiết</p>
          </div>
          
          <div className="profile-stats">
             <div className="stat-box">
                <small>Đã đặt</small>
                <strong>{stats.totalBookings}</strong>
             </div>
             <div className="stat-box">
                <small>Chi tiêu</small>
                <strong>${stats.totalSpent}</strong>
             </div>
          </div>

          <div className="sidebar-menu">
            <button 
              className={activeTab === 'info' ? 'active' : ''} 
              onClick={() => setActiveTab('info')}
            >
              Thông tin cá nhân
            </button>
            <button 
              className={activeTab === 'history' ? 'active' : ''} 
              onClick={() => setActiveTab('history')}
            >
              Lịch sử đặt phòng
            </button>
            <button 
              className={activeTab === 'bills' ? 'active' : ''} 
              onClick={() => setActiveTab('bills')}
            >
              Hóa đơn của tôi
            </button>
            <button onClick={handleLogout} className="logout-btn-menu">
              Đăng xuất
            </button>
          </div>
        </div>

        {/* CONTENT PHẢI */}
        <div className="profile-main-content">
          <h2>
            {activeTab === 'info' && 'Hồ sơ của tôi'}
            {activeTab === 'history' && 'Lịch sử đặt phòng'}
            {activeTab === 'bills' && 'Danh sách hóa đơn'}
          </h2>
          {isLoadingData ? <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>Đang tải dữ liệu...</div> : renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;