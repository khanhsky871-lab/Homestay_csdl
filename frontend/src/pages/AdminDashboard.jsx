import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

// --- CẤU HÌNH HẰNG SỐ ---
const API_BASE_URL = 'http://localhost:8080';

const ROOM_TYPES = ['Single', 'Family', 'Luxury', 'Standard', 'Vip']; 
const ROOM_STATUSES = ['Available', 'Maintenance', 'Occupied', 'Cleaning', 'Deleted']; 

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(false);

    // --- DATA STATES ---
    const [users, setUsers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [services, setServices] = useState([]);
    const [serviceGroups, setServiceGroups] = useState([]); 
    const [schedules, setSchedules] = useState([]); // Lịch làm việc

    const [selectedFiles, setSelectedFiles] = useState([]); 

    // --- FORM STATES ---
    
    // 1. Form Phòng
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [newRoom, setNewRoom] = useState({
        name: '', address: '', price: 0, description: '', city: 'Hanoi', 
        country: 'Vietnam', maxGuests: 2, capacity: 2, type: '', status: 'AVAILABLE' 
    });

    // 2. Form Dịch vụ
    const [showAddService, setShowAddService] = useState(false);
    const [newService, setNewService] = useState({
        name: '', unitPrice: 0, description: '', isActive: true, groupId: ''
    });

    // 3. Form Nhân viên
    const [showAddEmployee, setShowAddEmployee] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        name: '', username: '', password: '', email: '', phone: ''
    });

    // 4. Form Lịch làm việc (Phân công hàng loạt)
    const [showAddSchedule, setShowAddSchedule] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        employeeId: '',
        task: '',
        fromDate: '',  // Từ ngày
        toDate: '',    // Đến ngày
        dayOff: 'NONE', // Ngày nghỉ
        startTime: '',
        endTime: ''
    });

    const token = localStorage.getItem('token');
    const getAuthConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

    // --- HELPER FUNCTIONS ---
    const formatCurrency = (amount) => {
        if (!amount) return "0 VNĐ";
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
    };

    const formatDate = (dateString) => {
        if (!dateString) return "---";
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // --- USE EFFECT (LOAD DỮ LIỆU) ---
    useEffect(() => {
        // User & Employee chung 1 API
        if (activeTab === 'users' || activeTab === 'employees' || activeTab === 'schedules') fetchUsers();
        
        if (activeTab === 'rooms') fetchRooms();
        // Booking & Stats dùng chung dữ liệu booking
        if (activeTab === 'bookings' || activeTab === 'stats') fetchBookings();
        
        if (activeTab === 'services') {
            fetchServices();
            fetchServiceGroups(); 
        }

        if (activeTab === 'schedules') {
            fetchSchedules();
        }
    }, [activeTab, navigate, token]);


    // --- API CALL HANDLERS (GET) ---

    const fetchUsers = async () => { 
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/users`, getAuthConfig());
            setUsers(res.data.data || res.data.result || []);
        } catch (error) { console.error("Lỗi tải Users:", error); } finally { setLoading(false); }
    };
    
    const fetchRooms = async () => { 
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/rooms?page=0&size=100`); 
            setRooms(res.data.content || res.data.data || []);
        } catch (error) { console.error("Lỗi tải Rooms:", error); } finally { setLoading(false); }
    };

    const fetchBookings = async () => { 
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/reservations?page=0&size=100`, getAuthConfig());
            setBookings(res.data.content || res.data.data || []);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const fetchServices = async () => { 
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/services`, getAuthConfig());
            setServices(res.data.content || res.data.data || []); 
        } catch (error) { console.error("Lỗi tải dịch vụ:", error); } finally { setLoading(false); }
    };

   const fetchServiceGroups = async () => { 
        try {
            const res = await axios.get(`${API_BASE_URL}/services/service-groups`, getAuthConfig());
            let finalData = [];
            if (Array.isArray(res.data)) finalData = res.data;
            else if (res.data && Array.isArray(res.data.data)) finalData = res.data.data;
            else if (res.data && Array.isArray(res.data.result)) finalData = res.data.result;
            setServiceGroups(finalData); 
        } catch (error) { console.error("Lỗi load nhóm dịch vụ:", error); } 
    };

    const fetchSchedules = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/schedules`, getAuthConfig());
            setSchedules(res.data.data || []);
        } catch (error) { console.error("Lỗi tải lịch:", error); }
    };

    // --- ACTION HANDLERS (POST/DELETE) ---

    const handleFileChange = (e) => {
        setSelectedFiles(e.target.files);
    };

    const handleConfirmPayment = async (reservationId) => {
        if (window.confirm("Xác nhận khách đã thanh toán và xuất hóa đơn?")) {
            try {
                await axios.post(`${API_BASE_URL}/reservations/${reservationId}/pay`, {}, getAuthConfig());
                alert("Thanh toán thành công!");
                fetchBookings(); 
            } catch (error) {
                alert("Lỗi: " + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newEmployee,
                gender: 'Other',          
                city: 'Hanoi',
                country: 'Vietnam',
                address: 'Office',
                identityCard: '000' + Math.floor(Math.random() * 1000),
                roleId: 3, 
                description: 'Nhân viên mới'
            };
            await axios.post(`${API_BASE_URL}/users/employee`, payload, getAuthConfig());
            alert("Tạo tài khoản nhân viên thành công!");
            setShowAddEmployee(false);
            setNewEmployee({ name: '', username: '', password: '', email: '', phone: '' });
            fetchUsers(); 
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || error.message));
        }
    };

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        if (!newSchedule.employeeId) { alert("Vui lòng chọn nhân viên!"); return; }
        
        try {
            // Gọi API Phân công hàng loạt
            await axios.post(`${API_BASE_URL}/schedules/bulk`, newSchedule, getAuthConfig());
            alert("Phân công lịch hàng loạt thành công!");
            setShowAddSchedule(false);
            setNewSchedule({ employeeId: '', task: '', fromDate: '', toDate: '', dayOff: 'NONE', startTime: '', endTime: '' });
            fetchSchedules();
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || error.message));
        }
    };
const handleExportExcel = async () => {
        try {
            // Gọi API Backend (đường dẫn phải khớp với Controller bạn viết)
            const response = await axios.get(
                `${API_BASE_URL}/admin/statistics/export`, 
                { 
                    ...getAuthConfig(), // Kèm Token xác thực
                    responseType: 'blob' // QUAN TRỌNG: Báo cho axios biết đây là file
                }
            );

            // Tạo một url giả từ dữ liệu blob nhận được
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Đặt tên file khi tải về
            link.setAttribute('download', `Bao_Cao_Doanh_Thu_${new Date().toISOString().slice(0,10)}.xlsx`);
            
            // Kích hoạt click để tải
            document.body.appendChild(link);
            link.click();
            
            // Dọn dẹp
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Lỗi xuất Excel:", error);
            alert("Không thể xuất báo cáo. Vui lòng kiểm tra lại Server!");
        }
    };
    const handleDeleteSchedule = async (id) => {
        if(window.confirm("Bạn có chắc muốn xóa lịch làm việc này?")) {
            try {
                await axios.delete(`${API_BASE_URL}/schedules/${id}`, getAuthConfig());
                fetchSchedules();
            } catch (error) { alert("Lỗi xóa: " + error.message); }
        }
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE_URL}/rooms`, newRoom, getAuthConfig());
            const createdRoomId = res.data.data.id; 

            if (selectedFiles && selectedFiles.length > 0 && createdRoomId) {
                const formData = new FormData();
                for (let i = 0; i < selectedFiles.length; i++) {
                    formData.append("files", selectedFiles[i]);
                }
                await axios.post(
                    `${API_BASE_URL}/rooms/${createdRoomId}/images`, 
                    formData, 
                    { headers: { ...getAuthConfig().headers, "Content-Type": "multipart/form-data" } }
                );
            }
            alert("Thêm phòng và ảnh thành công!"); 
            setShowAddRoom(false); 
            setNewRoom({ name: '', address: '', price: 0, description: '', city: 'Hanoi', country: 'Vietnam', maxGuests: 2, capacity: 2, type: 'STANDARD', status: 'AVAILABLE' });
            setSelectedFiles([]); 
            fetchRooms(); 
        } catch (error) { 
            alert("Lỗi thêm phòng: " + (error.response?.data?.message || error.message)); 
        }
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newService,
                groupId: parseInt(newService.groupId, 10),
                unitPrice: parseFloat(newService.unitPrice) || 0
            };
            await axios.post(`${API_BASE_URL}/services`, payload, getAuthConfig());
            alert("Thêm dịch vụ thành công!");
            setShowAddService(false);
            setNewService({ name: '', unitPrice: 0, description: '', isActive: true, groupId: '' }); 
            fetchServices();
        } catch (error) {
            alert("Lỗi thêm dịch vụ: " + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteService = async (id) => {
        if(window.confirm("Bạn có chắc muốn xóa dịch vụ này?")) {
            try {
                await axios.delete(`${API_BASE_URL}/services/${id}`, getAuthConfig());
                alert("Đã xóa!"); fetchServices();
            } catch (error) { alert("Lỗi xóa: " + error.message); }
        }
    }

    const handleLogout = () => { localStorage.clear(); navigate('/auth'); };


    // --- RENDER UI FUNCTIONS ---

    const renderUsers = () => ( 
        <div className="table-responsive">
            <table className="admin-table">
                <thead><tr><th>ID</th><th>Tên</th><th>Username</th><th>Email</th><th>Quyền</th></tr></thead>
                <tbody>
                    {users && users.length > 0 ? users.map(u => (
                        <tr key={u.id}>
                            <td>{u.id}</td><td>{u.name}</td><td>{u.username}</td><td>{u.email}</td>
                            <td><span className={u.roleName === 'Admin' ? 'badge-admin' : 'badge-user'}>{u.roleName}</span></td>
                        </tr>
                    )) : <tr><td colSpan="5" className="empty-text">Không có dữ liệu người dùng</td></tr>}
                </tbody>
            </table>
        </div>
    );

    const renderEmployees = () => {
        const staffList = users.filter(u => u.roleName === 'Staff' || u.roleName === 'NhanVien');
        return (
            <div>
                <button className="btn-add" onClick={() => setShowAddEmployee(!showAddEmployee)}>
                    {showAddEmployee ? 'Đóng' : '+ Thêm Nhân viên mới'}
                </button>

                {showAddEmployee && (
                    <form className="add-room-form" onSubmit={handleAddEmployee} style={{marginBottom:'20px', padding:'15px', border:'1px solid #ddd'}}>
                        <h3>Tạo tài khoản nhân viên</h3>
                        <div className="form-row">
                            <div style={{flex:1, marginRight:'10px'}}><label>Họ tên:</label><input type="text" required value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} /></div>
                            <div style={{flex:1}}><label>SĐT:</label><input type="text" required value={newEmployee.phone} onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})} /></div>
                        </div>
                        <div className="form-row">
                            <div style={{flex:1, marginRight:'10px'}}><label>Username:</label><input type="text" required value={newEmployee.username} onChange={e => setNewEmployee({...newEmployee, username: e.target.value})} /></div>
                            <div style={{flex:1}}><label>Email:</label><input type="email" required value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} /></div>
                        </div>
                        <div className="form-row"><div style={{flex:1}}><label>Mật khẩu:</label><input type="password" required value={newEmployee.password} onChange={e => setNewEmployee({...newEmployee, password: e.target.value})} /></div></div>
                        <button type="submit" className="btn-submit" style={{marginTop:'15px'}}>Tạo tài khoản</button>
                    </form>
                )}

                <div className="table-responsive">
                    <table className="admin-table">
                        <thead><tr><th>ID</th><th>Tên nhân viên</th><th>Username</th><th>SĐT</th><th>Email</th></tr></thead>
                        <tbody>
                            {staffList.length > 0 ? staffList.map(u => (
                                <tr key={u.id}><td>{u.id}</td><td><strong>{u.name}</strong></td><td>{u.username}</td><td>{u.phone}</td><td>{u.email}</td></tr>
                            )) : <tr><td colSpan="5" className="empty-text">Chưa có nhân viên nào</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderSchedules = () => {
        const staffList = users.filter(u => u.roleName === 'Staff' || u.roleName === 'NhanVien');
        const daysOfWeek = [
            { value: 'NONE', label: 'Không nghỉ (Làm cả tuần)' },
            { value: 'MONDAY', label: 'Thứ 2' }, { value: 'TUESDAY', label: 'Thứ 3' },
            { value: 'WEDNESDAY', label: 'Thứ 4' }, { value: 'THURSDAY', label: 'Thứ 5' },
            { value: 'FRIDAY', label: 'Thứ 6' }, { value: 'SATURDAY', label: 'Thứ 7' }, { value: 'SUNDAY', label: 'Chủ Nhật' }
        ];

        return (
            <div>
                <button className="btn-add" onClick={() => setShowAddSchedule(!showAddSchedule)}>
                    {showAddSchedule ? 'Đóng' : '+ Phân công (Hàng loạt)'}
                </button>

                {showAddSchedule && (
                    <form className="add-room-form" onSubmit={handleAddSchedule} style={{marginBottom:'20px', padding:'15px', border:'1px solid #ddd'}}>
                        <h3>Phân công lịch làm việc</h3>
                        <div className="form-row">
                            <div style={{flex:1, marginRight:'10px'}}>
                                <label>Chọn nhân viên:</label>
                                <select required value={newSchedule.employeeId} onChange={e => setNewSchedule({...newSchedule, employeeId: e.target.value})} style={{width:'100%', padding:'10px', border:'1px solid #ccc', borderRadius:'5px'}}>
                                    <option value="">-- Chọn nhân viên --</option>
                                    {staffList.map(u => (<option key={u.id} value={u.id}>{u.name} ({u.username})</option>))}
                                </select>
                            </div>
                            <div style={{flex:1}}><label>Nhiệm vụ:</label><input type="text" placeholder="VD: Trực lễ tân..." required value={newSchedule.task} onChange={e => setNewSchedule({...newSchedule, task: e.target.value})} /></div>
                        </div>
                        <div className="form-row">
                            <div style={{flex:1, marginRight:'10px'}}><label>Từ ngày:</label><input type="date" required value={newSchedule.fromDate} onChange={e => setNewSchedule({...newSchedule, fromDate: e.target.value})} /></div>
                            <div style={{flex:1}}><label>Đến ngày:</label><input type="date" required value={newSchedule.toDate} onChange={e => setNewSchedule({...newSchedule, toDate: e.target.value})} /></div>
                        </div>
                        <div className="form-row">
                            <div style={{flex:1, marginRight:'10px'}}>
                                <label>Ngày nghỉ (Off):</label>
                                <select value={newSchedule.dayOff} onChange={e => setNewSchedule({...newSchedule, dayOff: e.target.value})} style={{width:'100%', padding:'10px', border:'1px solid #ccc', borderRadius:'5px'}}>
                                    {daysOfWeek.map(d => (<option key={d.value} value={d.value}>{d.label}</option>))}
                                </select>
                            </div>
                            <div style={{flex:1, display:'flex', gap:'10px'}}>
                                <div style={{flex:1}}><label>Bắt đầu:</label><input type="time" required value={newSchedule.startTime} onChange={e => setNewSchedule({...newSchedule, startTime: e.target.value})} /></div>
                                <div style={{flex:1}}><label>Kết thúc:</label><input type="time" required value={newSchedule.endTime} onChange={e => setNewSchedule({...newSchedule, endTime: e.target.value})} /></div>
                            </div>
                        </div>
                        <button type="submit" className="btn-submit" style={{marginTop:'15px'}}>Xác nhận phân công</button>
                    </form>
                )}

                <div className="table-responsive">
                    <table className="admin-table">
                        <thead><tr><th>Ngày</th><th>Nhân viên</th><th>Ca làm</th><th>Nhiệm vụ</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                        <tbody>
                            {schedules.length > 0 ? schedules.map(s => (
                                <tr key={s.id}>
                                    <td>{formatDate(s.workDate)}</td>
                                    <td><strong>{s.employeeName || "Unknown"}</strong></td>
                                    <td style={{color:'#008080'}}>{s.startTime} - {s.endTime}</td>
                                    <td>{s.task}</td>
                                    <td><span className="status-badge" style={{backgroundColor:'#f0f0f0'}}>{s.status}</span></td>
                                    <td><button className="btn-delete" onClick={() => handleDeleteSchedule(s.id)}>Xóa</button></td>
                                </tr>
                            )) : <tr><td colSpan="6" className="empty-text">Chưa có lịch làm việc nào</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderRooms = () => (
        <div>
            <button className="btn-add" onClick={() => setShowAddRoom(!showAddRoom)}>{showAddRoom ? 'Đóng' : '+ Thêm phòng mới'}</button>
            {showAddRoom && (
                <form className="add-room-form" onSubmit={handleAddRoom}>
                    <div className="form-row">
                        <select required name="type" value={newRoom.type} onChange={e => setNewRoom({...newRoom, type: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}>
                            <option value="">-- Chọn Loại Phòng --</option>
                            {ROOM_TYPES.map(type => (<option key={type} value={type}>{type}</option>))}
                        </select>
                        <select required name="status" value={newRoom.status} onChange={e => setNewRoom({...newRoom, status: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}>
                            <option value="">-- Chọn Trạng Thái --</option>
                            {ROOM_STATUSES.map(status => (<option key={status} value={status}>{status}</option>))}
                        </select>
                    </div>
                    <div className="form-row">
                        <input type="text" placeholder="Tên phòng" required value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} />
                        <input type="number" placeholder="Giá" required value={newRoom.price} onChange={e => setNewRoom({...newRoom, price: parseInt(e.target.value) || 0})} />
                        <input type="number" placeholder="Sức chứa" required value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="form-row">
                        <input type="text" placeholder="Địa chỉ" required value={newRoom.address} onChange={e => setNewRoom({...newRoom, address: e.target.value})} />
                        <input type="text" placeholder="Thành phố" required value={newRoom.city} onChange={e => setNewRoom({...newRoom, city: e.target.value})} />
                    </div>
                    <div className="form-row" style={{marginTop: '15px', border: '1px dashed #ccc', padding: '10px', borderRadius: '5px'}}>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Chọn ảnh phòng:</label>
                        <input type="file" multiple onChange={handleFileChange} accept="image/*" style={{border: 'none', width: '100%'}} />
                    </div>
                    <button type="submit" className="btn-submit">Lưu phòng</button>
                </form>
            )}
            <div className="table-responsive">
                <table className="admin-table">
                    <thead><tr><th>ID</th><th>Tên phòng</th><th>Giá</th><th>Địa chỉ</th><th>Ảnh</th></tr></thead>
                    <tbody>
                        {rooms && rooms.length > 0 ? (
                            rooms.filter(r => r.status !== 'Deleted').map(r => (
                                <tr key={r.id}>
                                    <td>{r.id}</td><td>{r.name}</td>
                                    <td style={{color:'green', fontWeight:'bold'}}>{formatCurrency(r.price)}</td>
                                    <td>{r.address}</td>
                                    <td>{r.images && r.images.length > 0 ? <span style={{fontSize:'12px', color: 'blue'}}>Có {r.images.length} ảnh</span> : <span style={{fontSize:'12px', color: '#999'}}>Không có</span>}</td>
                                </tr>
                            ))
                        ) : <tr><td colSpan="5" className="empty-text">Chưa có phòng nào</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderBookings = () => {
        const activeBookings = bookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Rejected');
        return (
            <div>
                <div style={{marginBottom: '15px'}}><h3>Quản lý thanh toán ({activeBookings.length})</h3></div>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead><tr><th>Mã</th><th>Phòng</th><th>Lịch thuê</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
                        <tbody>
                            {activeBookings && activeBookings.length > 0 ? (
                                activeBookings.map(b => (
                                    <tr key={b.id}>
                                        <td><strong>#{b.id}</strong></td>
                                        <td><div style={{fontWeight: 'bold', fontSize: '15px', color: '#2c3e50'}}>{b.roomName || `Phòng ${b.roomId}`}</div></td>
                                        <td>
                                            <div style={{color: '#008080'}}>In: {formatDate(b.checkInDate)}</div>
                                            <div style={{color: '#d35400'}}>Out: {formatDate(b.checkOutDate)}</div>
                                        </td>
                                        <td style={{fontWeight: 'bold', fontSize: '15px'}}>{formatCurrency(b.total)}</td>
                                        <td>
                                            {b.paymentStatus === 'Paid' ? (
                                                <span className="status-badge paid" style={{backgroundColor: '#e6fffa', color: '#008080', padding: '8px 12px', borderRadius: '5px', border: '1px solid #008080'}}>✅ Đã thanh toán</span>
                                            ) : (
                                                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                    <span style={{color: 'red', fontSize: '12px', fontStyle: 'italic'}}>Chưa TT</span>
                                                    <button onClick={() => handleConfirmPayment(b.id)} style={{backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>💲 Thu tiền</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (<tr><td colSpan="5" className="empty-text">Không có dữ liệu</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderStats = () => {
        const paidBookings = bookings.filter(b => b.paymentStatus === 'Paid');
        
        // Logic tính toán doanh thu theo tháng
        const revenueByMonth = paidBookings.reduce((acc, curr) => {
            const date = new Date(curr.checkInDate);
            const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
            if (!acc[monthKey]) acc[monthKey] = { total: 0, count: 0 };
            acc[monthKey].total += curr.total;
            acc[monthKey].count += 1;
            return acc;
        }, {});
        
        const totalRevenueAllTime = paidBookings.reduce((acc, curr) => acc + curr.total, 0);

        return (
            <div>
                {/* --- PHẦN HEADER CÓ NÚT XUẤT EXCEL --- */}
                <div style={{
                    marginBottom: '20px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                }}>
                    {/* Bên trái: Tiêu đề và ô tổng tiền */}
                    <div>
                        <h3>Báo cáo doanh thu</h3>
                        <div style={{
                            background: 'linear-gradient(135deg, #008080 0%, #00b3b3 100%)', 
                            color: 'white', 
                            padding: '20px', 
                            borderRadius: '10px', 
                            display: 'inline-block', 
                            minWidth: '250px', 
                            boxShadow: '0 4px 15px rgba(0, 128, 128, 0.3)'
                        }}>
                            <div style={{fontSize: '14px', opacity: 0.9}}>Tổng doanh thu thực tế</div>
                            <div style={{fontSize: '28px', fontWeight: 'bold', marginTop: '5px'}}>
                                {formatCurrency(totalRevenueAllTime)}
                            </div>
                            <div style={{fontSize: '12px', marginTop: '5px'}}>
                                Trên tổng số {paidBookings.length} đơn hàng thành công
                            </div>
                        </div>
                    </div>

                    {/* Bên phải: NÚT XUẤT EXCEL (ĐÃ THÊM MỚI) */}
                    <button 
                        onClick={handleExportExcel}
                        style={{
                            backgroundColor: '#217346', // Màu xanh Excel
                            color: 'white', 
                            border: 'none', 
                            padding: '12px 24px', 
                            borderRadius: '5px', 
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}
                    >
                        {/* Icon Excel đơn giản bằng text hoặc bạn có thể dùng FontAwesome */}
                        <span style={{fontSize: '18px'}}>📊</span> Xuất Excel
                    </button>
                </div>

                {/* --- PHẦN BẢNG DỮ LIỆU (GIỮ NGUYÊN) --- */}
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead><tr><th>Tháng / Năm</th><th>Số lượng đơn</th><th>Doanh thu tháng</th></tr></thead>
                        <tbody>
                            {Object.keys(revenueByMonth).length > 0 ? (
                                Object.keys(revenueByMonth).map(month => (
                                    <tr key={month}>
                                        <td style={{fontWeight: 'bold', color: '#555'}}>Tháng {month}</td>
                                        <td>{revenueByMonth[month].count} đơn</td>
                                        <td style={{color: '#d35400', fontWeight: 'bold', fontSize: '16px'}}>
                                            {formatCurrency(revenueByMonth[month].total)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="empty-text" style={{textAlign: 'center', padding: '30px'}}>
                                        Chưa có dữ liệu thanh toán nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };
    const renderServices = () => (
        <div>
            <button className="btn-add" onClick={() => setShowAddService(!showAddService)}>{showAddService ? 'Đóng' : '+ Thêm Dịch vụ mới'}</button>
            {showAddService && (
                <form className="add-room-form" onSubmit={handleAddService} style={{marginBottom: '20px', padding: '15px', border: '1px solid #ddd'}}>
                    {/* ... */}
                    <h3>Thêm dịch vụ mới</h3>
                    <div style={{marginBottom: '15px'}}>
                        <label style={{fontWeight: 'bold'}}>Chọn nhóm dịch vụ (*):</label>
                        <select required value={newService.groupId} onChange={e => setNewService({...newService, groupId: e.target.value})} style={{width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '5px'}}>
                            <option value="">-- Vui lòng chọn nhóm --</option>
                            {Array.isArray(serviceGroups) && serviceGroups.length > 0 ? (
                                serviceGroups.map(group => (<option key={group.id} value={group.id}>{group.name}</option>))
                            ) : (<option disabled>Không tải được nhóm</option>)}
                        </select>
                    </div>
                    <div className="form-row">
                        <div style={{flex: 1, marginRight: '10px'}}><label>Tên dịch vụ:</label><input type="text" placeholder="VD: Ăn sáng..." required value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} style={{width: '100%'}} /></div>
                        <div style={{flex: 1}}><label>Giá tiền:</label><input type="number" placeholder="VNĐ" required value={newService.unitPrice} onChange={e => setNewService({...newService, unitPrice: parseInt(e.target.value) || 0})} style={{width: '100%'}} /></div>
                    </div>
                    <div className="form-row" style={{marginTop: '10px'}}><input type="text" placeholder="Mô tả chi tiết" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} style={{width: '100%'}} /></div>
                    <button type="submit" className="btn-submit" style={{marginTop: '15px'}}>Lưu dịch vụ</button>
                </form>
            )}
            <div className="table-responsive">
                <table className="admin-table">
                    <thead><tr><th>ID</th><th>Tên dịch vụ</th><th>Đơn giá</th><th>Mô tả</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {Array.isArray(services) && services.length > 0 ? 
                            services.filter(s => s.isActive === true).map(s => (
                                <tr key={s.id}>
                                    <td>{s.id}</td><td>{s.name}</td><td style={{color: '#d35400', fontWeight: 'bold'}}>{formatCurrency(s.unitPrice)}</td><td>{s.description}</td>
                                    <td><span className="badge-user" style={{backgroundColor: '#e6fffa', color: '#008080'}}>Active</span></td>
                                    <td><button className="btn-delete" onClick={() => handleDeleteService(s.id)}>Xóa</button></td>
                                </tr>
                            )) : <tr><td colSpan="6" className="empty-text">Chưa có dịch vụ nào</td></tr>
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="admin-container">
            <div className="sidebar">
                <h2>Admin Panel</h2>
                <ul>
                    <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Quản lý Users</li>
                    <li className={activeTab === 'employees' ? 'active' : ''} onClick={() => setActiveTab('employees')}>Quản lý Nhân viên</li>
                    <li className={activeTab === 'schedules' ? 'active' : ''} onClick={() => setActiveTab('schedules')}>📅 Lịch làm việc</li>
                    <li className={activeTab === 'rooms' ? 'active' : ''} onClick={() => setActiveTab('rooms')}>Quản lý Phòng</li>
                    <li className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>Booking</li>
                    <li className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>Quản lý Dịch vụ</li>
                    <li className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>📊 Thống kê Doanh thu</li>
                    <li onClick={handleLogout} style={{color: '#e74c3c', marginTop: 'auto', cursor:'pointer'}}>Đăng xuất</li>
                </ul>
            </div>

            <div className="main-content">
                <h1>
                    {activeTab === 'users' && 'Danh sách người dùng'}
                    {activeTab === 'employees' && 'Danh sách nhân viên'}
                    {activeTab === 'schedules' && 'Quản lý lịch làm việc'}
                    {activeTab === 'rooms' && 'Quản lý phòng'}
                    {activeTab === 'bookings' && 'Danh sách đặt phòng'}
                    {activeTab === 'services' && 'Quản lý dịch vụ'}
                    {activeTab === 'stats' && 'Thống kê doanh thu'}
                </h1>
                
                {loading ? <p>Đang tải dữ liệu...</p> : (
                    <>
                        {activeTab === 'users' && renderUsers()}
                        {activeTab === 'employees' && renderEmployees()}
                        {activeTab === 'schedules' && renderSchedules()}
                        {activeTab === 'rooms' && renderRooms()}
                        {activeTab === 'bookings' && renderBookings()}
                        {activeTab === 'services' && renderServices()}
                        {activeTab === 'stats' && renderStats()}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;