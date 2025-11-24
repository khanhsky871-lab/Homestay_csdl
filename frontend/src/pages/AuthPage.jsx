import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import './AuthPage.css';

const AuthPage = () => {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate(); // 2. Khởi tạo hook
  
  const [isLogin, setIsLogin] = useState(true);
  
  // 3. Thêm trường username vào state
  const [form, setForm] = useState({ name: '', username: '', password: '' }); 
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // Để hiện thông báo thành công

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Kiểm tra dữ liệu cơ bản
    if (!form.username || !form.password) {
        setError("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    let res;
    if (isLogin) {
      // Đăng nhập
      res = await login(form.username, form.password);
    } else {
      // Đăng ký: Gửi name, email (tạm để rỗng hoặc dùng username), password, username
      // Lưu ý: Mock Context đang nhận (name, email, password, username)
      // Ta sẽ dùng username cho cả trường email để test cho tiện
      res = await register(form.name, form.username, form.password, form.username);
    }

    if (!res.success) {
      setError(res.message);
    } else {
      // --- XỬ LÝ KHI THÀNH CÔNG ---
      if (isLogin) {
        // Nếu login thành công -> Chuyển về trang chủ hoặc trang Profile
        navigate('/profile'); 
      } else {
        // Nếu đăng ký thành công -> Thông báo và chuyển sang tab Login
        setMessage('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsLogin(true);
        setForm({ ...form, password: '' }); // Xóa mật khẩu
      }
    }
  };

  return (
    <div className="auth-container">
        <h1><Link className='logo-link' to="/">Myhomestay</Link></h1>
        <div className="auth-card">
          <h2>{isLogin ? 'Login' : 'Register'}</h2>

          {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
          {message && <p style={{ color: 'green', marginBottom: '10px' }}>{message}</p>}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Input Name chỉ hiện khi Đăng ký */}
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="auth-input"
                required={!isLogin}
              />
            )}

            {/* Đổi Email thành Username để khớp với Mock/API */}
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="auth-input"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="auth-input"
              required
            />

            <button type="submit" className="auth-button">
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          <p className="auth-toggle">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <span onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setMessage('');
            }}>
              {isLogin ? 'Register' : 'Login'}
            </span>
          </p>
        </div>
    </div>
  );
};

export default AuthPage;