// src/components/HomeSlider.js
import React, { useState, useContext, useEffect } from "react";
import Slider from "react-slick";
import { AuthContext } from "../../context/AuthContext"; 
import { useNavigate } from "react-router-dom"; 
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./HomeSlider.css";

// Dữ liệu phòng giả lập (Ảnh chất lượng cao)
const rooms = [
  {
    id: 1,
    name: "Deluxe Ocean View",
    price: 120,
    status: "Available",
    description: "Phòng đôi sang trọng với tầm nhìn hướng biển tuyệt đẹp, đầy đủ tiện nghi.",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Standard King Room",
    price: 80,
    status: "Occupied",
    description: "Phòng tiêu chuẩn giường lớn, không gian ấm cúng, phù hợp cho cặp đôi.",
    img: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Family Suite",
    price: 200,
    status: "Available",
    description: "Căn hộ rộng rãi cho gia đình 4 người, có bếp riêng và phòng khách.",
    img: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Single Budget",
    price: 45,
    status: "Cleaning",
    description: "Phòng đơn tiết kiệm, sạch sẽ, phù hợp cho khách đi công tác.",
    img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 5,
    name: "Luxury Penthouse",
    price: 350,
    status: "Maintenance",
    description: "Căn hộ cao cấp nhất với hồ bơi riêng và dịch vụ quản gia 24/7.",
    img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop"
  }
];

// Component mũi tên tùy chỉnh
const PreArrow = ({ onClick }) => (
  <div className="arrow arrow-prev" onClick={onClick}>❮</div>
);
const NextArrow = ({ onClick }) => (
  <div className="arrow arrow-next" onClick={onClick}>❯</div>
);

const HomeSlider = () => {
  const { user, api } = useContext(AuthContext); // Lấy thông tin user và api
  const navigate = useNavigate(); // Hook chuyển trang

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isBookingMode, setIsBookingMode] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  // State form đặt phòng
  const [bookingData, setBookingData] = useState({
    checkInDate: "",
    checkOutDate: "",
    numGuests: 1,
    paymentMethod: "Cash"
  });

  // Settings Slider
  const settings = {
    dots: false,
    infinite: true,
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

  // Tự động tính tiền khi đổi ngày
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

  // Xử lý khi click vào phòng
  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setIsBookingMode(false);
    setTotalPrice(0);
    setBookingData({ ...bookingData, checkInDate: "", checkOutDate: "" });
  };

  const closeModal = () => {
    setSelectedRoom(null);
  };

  // Logic chuyển sang form đặt phòng (Kiểm tra Login)
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

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  // Xử lý Submit đặt phòng
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
        alert("Đặt phòng thành công! Vui lòng kiểm tra lịch sử trong trang cá nhân.");
        closeModal();
      } else {
        alert("Đặt phòng thất bại: " + (res.data.message || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi kết nối đến server.");
    }
  };

  return (
    <div className="slider-wrapper">
      <div className="slider-container">
        <h2 className="section-title">Khám phá các phòng nổi bật</h2>
        <Slider {...settings}>
          {rooms.map((room) => (
            <div key={room.id} className="slider-item" onClick={() => handleRoomClick(room)}>
              <div className="slick-slide-content room-card">
                <img src={room.img} alt={room.name} className="slider-image" />
                <span className={`status-badge ${room.status.toLowerCase()}`}>
                  {room.status}
                </span>
                <h3 className="slider-title">{room.name}</h3>
                <p className="slider-price">${room.price} / đêm</p>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* --- MODAL --- */}
      {selectedRoom && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>&times;</button>
            
            <div className="modal-body">
              {/* CỘT ẢNH */}
              <div className="modal-image-col">
                <img src={selectedRoom.img} alt={selectedRoom.name} />
              </div>

              {/* CỘT THÔNG TIN */}
              <div className="modal-info-col">
                {!isBookingMode ? (
                  // --- MODE XEM CHI TIẾT ---
                  <>
                    <h2>{selectedRoom.name}</h2>
                    <p className="modal-price">Giá: <span>${selectedRoom.price}</span> / đêm</p>
                    <div className="modal-status">
                      Trạng thái: <span className={`status-text ${selectedRoom.status.toLowerCase()}`}>{selectedRoom.status}</span>
                    </div>
                    <p className="modal-desc">{selectedRoom.description}</p>
                    
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
                  // --- MODE FORM ĐẶT PHÒNG ---
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
                      <span>Tổng cộng:</span>
                      <span className="price-value">${totalPrice > 0 ? totalPrice : 0}</span>
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