import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-row">
          {/* Cột 1: Giới thiệu */}
          <div className="footer-col">
            <h4>TravelVibe</h4>
            <p>
              Khám phá thế giới cùng chúng tôi. Những chuyến đi tuyệt vời, những
              trải nghiệm khó quên tại những địa điểm đẹp nhất hành tinh.
            </p>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div className="footer-col">
            <h4>Liên kết</h4>
            <ul>
              <li><a href="#home">Trang chủ</a></li>
              <li><a href="#tours">Tour du lịch</a></li>
              <li><a href="#destinations">Điểm đến</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div className="footer-col">
            <h4>Hỗ trợ</h4>
            <ul>
              <li><a href="#faq">Câu hỏi thường gặp</a></li>
              <li><a href="#policy">Chính sách bảo mật</a></li>
              <li><a href="#terms">Điều khoản dịch vụ</a></li>
              <li><a href="#contact">Liên hệ</a></li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ & Mạng xã hội */}
          <div className="footer-col">
            <h4>Liên hệ</h4>
            <p>📍 123 Đường ABC, Quận 1, TP.HCM</p>
            <p>📧 contact@travelvibe.com</p>
            <p>📞 +84 90 123 4567</p>
            <div className="social-links">
              <a href="#fb">Facebook</a>
              <a href="#ins">Instagram</a>
              <a href="#yt">Youtube</a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 TravelVibe. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;