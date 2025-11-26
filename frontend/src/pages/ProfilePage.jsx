import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, logout, loading, isAuthenticated, api } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('info'); 
  
  const [userInfo, setUserInfo] = useState(null); 
  const [reservations, setReservations] = useState([]);
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState({ totalSpent: 0, totalBookings: 0 });
  const [isLoadingData, setIsLoadingData] = useState(false);

  // --- STATE CHO VIỆC ĐẶT DỊCH VỤ ---
  const [serviceList, setServiceList] = useState([]); // Danh sách dịch vụ có sẵn (Phở, Giặt...)
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  
  // Form data trong modal
  const [serviceForm, setServiceForm] = useState({
      serviceId: "",
      quantity: 1
  });

  // Bảo vệ route
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      fetchServices(); // Tải danh sách dịch vụ ngay khi vào trang
    }
    // eslint-disable-next-line
  }, [isAuthenticated]);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const resProfile = await api.get('/users/my-info');
      if (resProfile.data.data) setUserInfo(resProfile.data.data);
      else if (resProfile.data.result) setUserInfo(resProfile.data.result);

      const resReservations = await api.get('/reservations?page=0&size=100&sortDirection=DESC');
      const reservationList = resReservations.data?.content || resReservations.data?.data?.content || []; 
      setReservations(reservationList);

      const resBills = await api.get('/bills');
      const billList = resBills.data?.data || [];
      setBills(billList);

      const validBookings = reservationList.filter(r => r.status !== 'Cancelled' && r.status !== 'Rejected');
      const totalMoney = validBookings.reduce((acc, curr) => acc + (curr.total || 0), 0);
      setStats({ totalSpent: totalMoney, totalBookings: reservationList.length });

    } catch (error) {
      console.error("Lỗi tải dữ liệu profile:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // --- HÀM LẤY DANH SÁCH DỊCH VỤ ---
  const fetchServices = async () => {
      try {
          const res = await api.get('/services');
          // Tùy cấu trúc API trả về (Page hay List)
          const list = res.data.content || res.data.data || [];
          // Chỉ lấy dịch vụ đang Active
          setServiceList(list.filter(s => s.isActive));
      } catch (error) {
          console.error("Lỗi tải dịch vụ:", error);
      }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    if(!dateString) return "---";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "0 VNĐ";
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'Paid': return 'Đã thanh toán';
      case 'Unpaid': return 'Chưa thanh toán';
      case 'Refunded': return 'Đã hoàn tiền';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  // --- XỬ LÝ MỞ MODAL ---
  const openServiceModal = (bookingId) => {
      setSelectedBookingId(bookingId);
      setShowServiceModal(true);
      setServiceForm({ serviceId: "", quantity: 1 }); // Reset form
  };

  // --- XỬ LÝ GỌI DỊCH VỤ (GỌI API) ---
  const handleSubmitService = async (e) => {
      e.preventDefault();
      if (!serviceForm.serviceId) {
          alert("Vui lòng chọn dịch vụ!");
          return;
      }
      if (serviceForm.quantity < 1) {
          alert("Số lượng phải lớn hơn 0");
          return;
      }

      try {
          const payload = {
              serviceId: parseInt(serviceForm.serviceId),
              quantity: parseInt(serviceForm.quantity)
          };
          
          // Gọi API thêm dịch vụ vào đơn đặt phòng
          await api.post(`/reservations/${selectedBookingId}/services`, payload);
          
          alert("Đã thêm dịch vụ thành công!");
          setShowServiceModal(false);
          fetchData(); // Tải lại dữ liệu để cập nhật tổng tiền mới
      } catch (error) {
          console.error(error);
          alert("Lỗi: " + (error.response?.data?.message || "Không thể thêm dịch vụ"));
      }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return null;

  const displayUser = userInfo || user;

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="tab-content info-tab">
            <h4 style={{borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', color: '#2E8B57'}}>Thông tin tài khoản</h4>
            <div className="detail-item"><label>Họ và tên:</label><span style={{fontWeight: 'bold', fontSize: '1.1em'}}>{displayUser.name}</span></div>
            <div className="detail-item"><label>Tên đăng nhập:</label><span>{displayUser.username}</span></div>
            <div className="detail-item"><label>Email:</label><span>{displayUser.email || '---'}</span></div>
            <div className="detail-item"><label>Vai trò:</label><span className="role-tag">{displayUser.roleName || displayUser.role?.name || "Member"}</span></div>

            <h4 style={{borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', marginTop: '30px', color: '#2E8B57'}}>Thông tin cá nhân</h4>
            <div className="detail-item"><label>Số điện thoại:</label><span>{displayUser.phone || '---'}</span></div>
            <div className="detail-item"><label>CMND / CCCD:</label><span>{displayUser.identityCard || '---'}</span></div>
            <div className="detail-item"><label>Giới tính:</label><span>{displayUser.gender === 'Male' ? 'Nam' : displayUser.gender === 'Female' ? 'Nữ' : displayUser.gender}</span></div>
             <div className="detail-item"><label>Địa chỉ:</label><span>{displayUser.address ? `${displayUser.address}, ` : ''}{displayUser.city ? `${displayUser.city}, ` : ''}{displayUser.country || ''}</span></div>
             <div className="detail-item"><label>Ngày tham gia:</label><span>{formatDate(displayUser.createdAt)}</span></div>
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
                      <th>Dịch vụ</th> {/* Cột mới */}
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td>{item.roomName || `Phòng ${item.roomId}`}</td>
                        <td>{formatDate(item.checkInDate)}</td>
                        <td>{formatDate(item.checkOutDate)}</td>
                        <td className="price-text">{formatCurrency(item.total)}</td>
                        <td><span className={`status-badge ${item.status?.toLowerCase()}`}>{item.status}</span></td>
                        
                        {/* NÚT GỌI DỊCH VỤ (Chỉ hiện khi chưa hủy và chưa thanh toán xong) */}
                        <td>
                            {item.status !== 'Cancelled' && item.paymentStatus !== 'Paid' && (
                                <button 
                                    className="btn-service" 
                                    onClick={() => openServiceModal(item.id)}
                                >
                                    + Gọi dịch vụ
                                </button>
                            )}
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
             {bills.length === 0 ? <p className="empty-state">Chưa có hóa đơn nào.</p> : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead><tr><th>Mã HĐ</th><th>Mã Đặt Phòng</th><th>Ngày tạo</th><th>Thành tiền</th></tr></thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill.id}>
                        <td>#{bill.id}</td>
                        <td>#{bill.reservationId}</td>
                        <td>{formatDate(bill.createdAt)}</td>
                        <td className="price-text">{formatCurrency(bill.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="profile-header">
            <div className="avatar-circle">{(displayUser.name || "U").charAt(0).toUpperCase()}</div>
            <h3>{displayUser.name}</h3>
            <p className="user-role">{displayUser.roleName || 'Member'}</p>
          </div>
          
          <div className="profile-stats">
             <div className="stat-box"><small>Đã đặt</small><strong>{stats.totalBookings}</strong></div>
             <div className="stat-box"><small>Chi tiêu</small><strong>{formatCurrency(stats.totalSpent)}</strong></div>
          </div>

          <div className="sidebar-menu">
            <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>Thông tin cá nhân</button>
            <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>Lịch sử đặt phòng</button>
            <button className={activeTab === 'bills' ? 'active' : ''} onClick={() => setActiveTab('bills')}>Hóa đơn của tôi</button>
            <button onClick={handleLogout} className="logout-btn-menu">Đăng xuất</button>
          </div>
        </div>

        <div className="profile-main-content">
          <h2>{activeTab === 'info' && 'Hồ sơ của tôi'}{activeTab === 'history' && 'Lịch sử đặt phòng'}{activeTab === 'bills' && 'Danh sách hóa đơn'}</h2>
          {isLoadingData ? <div style={{textAlign: 'center', padding: '20px'}}>Đang tải dữ liệu...</div> : renderContent()}
        </div>
      </div>

      {/* --- MODAL GỌI DỊCH VỤ --- */}
      {showServiceModal && (
          <div className="service-modal-overlay" onClick={() => setShowServiceModal(false)}>
              <div className="service-modal" onClick={e => e.stopPropagation()}>
                  <h3>Gọi thêm dịch vụ</h3>
                  <p style={{fontSize: '13px', color: '#666', marginBottom: '15px'}}>
                      Đơn đặt phòng: <strong>#{selectedBookingId}</strong>
                  </p>
                  
                  <form onSubmit={handleSubmitService}>
                      <div className="modal-form-group">
                          <label>Chọn dịch vụ:</label>
                          <select 
                              value={serviceForm.serviceId}
                              onChange={e => setServiceForm({...serviceForm, serviceId: e.target.value})}
                              required
                          >
                              <option value="">-- Chọn dịch vụ --</option>
                              {serviceList.map(s => (
                                  <option key={s.id} value={s.id}>
                                      {s.name} - {formatCurrency(s.unitPrice)}
                                  </option>
                              ))}
                          </select>
                      </div>

                      <div className="modal-form-group">
                          <label>Số lượng:</label>
                          <input 
                              type="number" 
                              min="1" 
                              value={serviceForm.quantity}
                              onChange={e => setServiceForm({...serviceForm, quantity: e.target.value})}
                              required
                          />
                      </div>

                      <div className="modal-actions">
                          <button type="button" className="btn-cancel" onClick={() => setShowServiceModal(false)}>Hủy</button>
                          <button type="submit" className="btn-confirm">Xác nhận gọi</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
};

export default ProfilePage;