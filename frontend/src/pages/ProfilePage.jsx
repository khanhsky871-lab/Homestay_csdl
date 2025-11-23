import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, logout, loading, isAuthenticated, api } = useContext(AuthContext);
  const navigate = useNavigate();

  // State quản lý Tab đang chọn
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'history', 'bills'
  
  // State dữ liệu
  const [reservations, setReservations] = useState([]);
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState({ totalSpent: 0, totalBookings: 0 });
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Bảo vệ route
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  // Gọi API lấy dữ liệu khi vào trang
  useEffect(() => {
    if (user) {
      fetchData();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      // 1. Gọi API lấy lịch sử đặt phòng
      // Lưu ý: Theo Swagger của bạn, response trả về phân trang trong 'content'
      const resReservations = await api.get('/reservations');
      const reservationList = resReservations.data?.data?.content || resReservations.data?.data || []; 
      setReservations(reservationList);

      // 2. Gọi API lấy hóa đơn
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

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return null;

  // Render từng Tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="tab-content info-tab">
            <div className="detail-item">
              <label>Full Name:</label>
              <span>{user.name || user.username}</span>
            </div>
            <div className="detail-item">
              <label>Username:</label>
              <span>{user.username}</span>
            </div>
            <div className="detail-item">
              <label>Email:</label>
              <span>{user.email || 'N/A'}</span>
            </div>
             <div className="detail-item">
              <label>Role:</label>
              <span>{user.role || 'Customer'}</span>
            </div>
            <div className="detail-item">
              <label>Account Status:</label>
              <span className="status-badge active">Active</span>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="tab-content history-tab">
            {reservations.length === 0 ? (
              <p className="empty-state">Chưa có lịch sử đặt phòng nào.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mã Đặt</th>
                      <th>Phòng</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td>{item.roomName}</td>
                        <td>{new Date(item.checkInDate).toLocaleDateString()}</td>
                        <td>{new Date(item.checkOutDate).toLocaleDateString()}</td>
                        <td>${item.total}</td>
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
                      <th>Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill.id}>
                        <td>#{bill.id}</td>
                        <td>#{bill.reservationId}</td>
                        <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
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
        {/* SIDEBAR TRÁI: Avatar & Menu */}
        <div className="profile-sidebar">
          <div className="profile-header">
            <div className="avatar-circle">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h3>{user.name || "User"}</h3>
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

        {/* CONTENT PHẢI: Nội dung thay đổi theo Tab */}
        <div className="profile-main-content">
          <h2>
            {activeTab === 'info' && 'Hồ sơ của tôi'}
            {activeTab === 'history' && 'Lịch sử đặt phòng'}
            {activeTab === 'bills' && 'Danh sách hóa đơn'}
          </h2>
          {isLoadingData ? <p>Đang tải dữ liệu...</p> : renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;