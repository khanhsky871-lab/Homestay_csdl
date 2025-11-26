// src/components/HomeSlider.js
import React, { useState, useContext, useEffect } from "react";
import Slider from "react-slick";
import { AuthContext } from "../../context/AuthContext"; 
import { useNavigate } from "react-router-dom"; 
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./HomeSlider.css";

// Component mũi tên tùy chỉnh
const PreArrow = ({ onClick }) => (
  <div className="arrow arrow-prev" onClick={onClick}>❮</div>
);
const NextArrow = ({ onClick }) => (
  <div className="arrow arrow-next" onClick={onClick}>❯</div>
);

const HomeSlider = () => {
  const { user, api } = useContext(AuthContext);
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isBookingMode, setIsBookingMode] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  const [bookingData, setBookingData] = useState({
    checkInDate: "",
    checkOutDate: "",
    numGuests: 1,
    paymentMethod: "Cash"
  });

  // --- HÀM FORMAT TIỀN TỆ (VNĐ) ---
  const formatCurrency = (amount) => {
    if (!amount) return "0 VNĐ";
    // Định dạng số: 100000 -> 100.000
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('/rooms?page=0&size=10&sortDirection=DESC');
        const roomList = res.data?.data?.content || res.data?.content || [];
        setRooms(roomList);
      } catch (error) {
        console.error("Lỗi khi tải danh sách phòng:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, [api]);

  const settings = {
    dots: false,
    infinite: rooms.length > 3,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    arrows: true,
    prevArrow: <PreArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } }
    ]
  };

  useEffect(() => {
    if (selectedRoom && bookingData.checkInDate && bookingData.checkOutDate) {
      const start = new Date(bookingData.checkInDate);
      const end = new Date(bookingData.checkOutDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        setTotalPrice(diffDays * selectedRoom.price);
      } else {
        setTotalPrice(0);
      }
    }
  }, [bookingData.checkInDate, bookingData.checkOutDate, selectedRoom]);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setIsBookingMode(false);
    setTotalPrice(0);
    setBookingData({ ...bookingData, checkInDate: "", checkOutDate: "" });
  };

  const closeModal = () => {
    setSelectedRoom(null);
  };

  const handleSwitchToBooking = () => {
    if (!user) {
      const confirmLogin = window.confirm(
        "Bạn cần đăng nhập để đặt phòng.\nĐi đến trang đăng nhập ngay?"
      );
      if (confirmLogin) {
        closeModal();
        navigate("/auth");
      }
      return;
    }
    setIsBookingMode(true);
  };

  const handleChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!bookingData.checkInDate || !bookingData.checkOutDate) {
      alert("Vui lòng chọn ngày nhận và trả phòng!");
      return;
    }

    if (totalPrice <= 0) {
      alert("Ngày trả phòng phải sau ngày nhận phòng!");
      return;
    }

    try {
      const payload = {
        roomId: selectedRoom.id,
        checkInDate: `${bookingData.checkInDate}T14:00:00`,
        checkOutDate: `${bookingData.checkOutDate}T12:00:00`,
        numGuests: parseInt(bookingData.numGuests),
        paymentMethod: bookingData.paymentMethod
      };

      const res = await api.post("/reservations", payload);

      if (res.data.success) {
        alert("Đặt phòng thành công! Đang chuyển hướng đến trang cá nhân...");
        closeModal();
        navigate("/profile");
      } else {
        alert("Đặt phòng thất bại: " + (res.data.message || "Lỗi server"));
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi kết nối server";
      alert("Lỗi: " + errorMsg);
    }
  };

  const getRoomImage = (room) => {
    if (room.images && room.images.length > 0) {
       if (typeof room.images[0] === 'string') return room.images[0];
       if (room.images[0].imageUrl) return room.images[0].imageUrl;
    }
    if (room.roomImages && room.roomImages.length > 0) {
       return room.roomImages[0].imageUrl || room.roomImages[0].image_url;
    }
    if (room.image) return room.image;
    if (room.imageUrl) return room.imageUrl;

    return "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop";
  };

  if (isLoading) {
    return <div className="slider-container" style={{textAlign:'center', padding: '50px'}}>Loading rooms...</div>;
  }

  return (
    <div className="slider-wrapper">
      <div className="slider-container">
        
        {rooms.length > 0 ? (
          <Slider {...settings}>
            {rooms.map((room) => (
              <div key={room.id} className="slider-item" onClick={() => handleRoomClick(room)}>
                <div className="slick-slide-content room-card">
                  <img 
                    src={getRoomImage(room)} 
                    alt={room.name} 
                    className="slider-image"
                    style={{
                        width: '100%', 
                        height: '180px',
                        objectFit: 'cover',
                        borderRadius: '8px 8px 0 0'
                    }} 
                  />
                  <span className={`status-badge ${room.status ? room.status.toLowerCase() : 'unknown'}`}>
                    {room.status || 'Unknown'}
                  </span>
                  <h3 className="slider-title">{room.name}</h3>
                  {/* --- SỬA HIỂN THỊ GIÁ --- */}
                  <p className="slider-price">{formatCurrency(room.price)} / đêm</p>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <p style={{textAlign: 'center', color: '#666'}}>Hiện chưa có phòng nào được hiển thị.</p>
        )}
      </div>

      {selectedRoom && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>&times;</button>
            
            <div className="modal-body">
              <div className="modal-image-col">
                <img 
                    src={getRoomImage(selectedRoom)} 
                    alt={selectedRoom.name} 
                    style={{
                        width: '100%',
                        height: '300px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                    }}
                />
              </div>

              <div className="modal-info-col">
                {!isBookingMode ? (
                  <>
                    <h2>{selectedRoom.name}</h2>
                    {/* --- SỬA HIỂN THỊ GIÁ --- */}
                    <p className="modal-price">Giá: <span>{formatCurrency(selectedRoom.price)}</span> / đêm</p>
                    
                    <div className="modal-status">
                      Trạng thái: <span className={`status-text ${selectedRoom.status ? selectedRoom.status.toLowerCase() : ''}`}>
                        {selectedRoom.status}
                      </span>
                    </div>
                    <p className="modal-desc">
                      {selectedRoom.description || "Chưa có mô tả cho phòng này."}
                    </p>
                    <p><strong>Sức chứa:</strong> {selectedRoom.capacity} người</p>
                    
                    {selectedRoom.status === "Available" ? (
                      <button className="book-now-btn" onClick={handleSwitchToBooking}>
                        Đặt phòng ngay
                      </button>
                    ) : (
                      <button className="book-now-btn disabled" disabled>
                        Hiện không khả dụng
                      </button>
                    )}

                    {!user && selectedRoom.status === "Available" && (
                        <p style={{fontSize: '13px', color: '#dc3545', marginTop: '10px', fontStyle: 'italic'}}>
                            * Yêu cầu đăng nhập để đặt phòng
                        </p>
                    )}
                  </>
                ) : (
                  <form className="booking-form" onSubmit={handleSubmitBooking}>
                    <h2>Xác nhận đặt phòng</h2>
                    <p className="room-name-confirm">Phòng: {selectedRoom.name}</p>

                    <div className="form-group">
                      <label>Ngày nhận phòng</label>
                      <input 
                        type="date" 
                        name="checkInDate" 
                        value={bookingData.checkInDate} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label>Ngày trả phòng</label>
                      <input 
                        type="date" 
                        name="checkOutDate" 
                        value={bookingData.checkOutDate} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group half">
                        <label>Số khách</label>
                        <input 
                          type="number" 
                          name="numGuests" 
                          min="1" 
                          max={selectedRoom.capacity} 
                          value={bookingData.numGuests} 
                          onChange={handleChange} 
                        />
                      </div>
                      <div className="form-group half">
                        <label>Thanh toán</label>
                        <select name="paymentMethod" value={bookingData.paymentMethod} onChange={handleChange}>
                          <option value="Cash">Tiền mặt</option>
                          <option value="CreditCard">Thẻ tín dụng</option>
                          <option value="BankTransfer">Chuyển khoản</option>
                        </select>
                      </div>
                    </div>

                    <div className="total-price-section">
                      <span>Tạm tính:</span>
                      {/* --- SỬA HIỂN THỊ TỔNG TIỀN --- */}
                      <span className="price-value">{formatCurrency(totalPrice > 0 ? totalPrice : 0)}</span>
                    </div>

                    <div className="button-group">
                      <button type="button" className="back-btn" onClick={() => setIsBookingMode(false)}>Quay lại</button>
                      <button type="submit" className="confirm-btn">Xác nhận đặt</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeSlider;