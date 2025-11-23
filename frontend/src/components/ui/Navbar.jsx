import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // Đảm bảo đường dẫn đúng tới file Context
import "./Navbar.css";

const Navbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <h2 className="logo">
        <Link to="/">MyHomestay</Link>
      </h2>
      <ul className="nav-links">
        <li>
          <Link to="/">Trang chủ</Link>
        </li>
        
        {/* Kiểm tra trạng thái đăng nhập */}
        {user ? (
          <li className="user-menu">
            <Link to="/profile" className="navbar-avatar" title={user.name}>
              {/* Lấy chữ cái đầu tiên của tên user */}
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </Link>
          </li>
        ) : (
          <li>
            <Link to="/auth" className="signin-btn">Sign in</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;