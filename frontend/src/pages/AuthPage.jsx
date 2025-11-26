import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthPage.css';

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const AuthPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  
  const [form, setForm] = useState({
      name: '',
      username: '',
      password: '',
      email: '',
      phone: '',
      identityCard: '',
      gender: 'Male',
      city: '',
      country: 'Vietnam',
      address: '',
      roleId: 1
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (isLogin) {
        if (!form.username || !form.password) {
            setError("Vui lòng nhập Username và Password");
            return;
        }
        
        const res = await login(form.username, form.password);
        
        if (!res.success) {
            setError(res.message);
        } else {
            const token = localStorage.getItem('token');
            if (token) {
                const decoded = parseJwt(token);
                
                //
                console.log(">>> CHECK TOKEN:", decoded);

                const tokenString = JSON.stringify(decoded);

                if (tokenString.includes("Admin") || tokenString.includes("ADMIN") || tokenString.includes("ROLE_ADMIN")) {
                    console.log("=> Phat hien Admin -> Chuyen huong Dashboard");
                    navigate('/admin');
                }
                else if (tokenString.includes("Staff") || tokenString.includes("STAFF") || tokenString.includes("ROLE_STAFF")) {
                    console.log("=> Phat hien Staff -> Chuyen huong EmployeeDashboard");
                    navigate('/employee-dashboard');
                }
                else {
                    console.log("=> Khong thay Admin -> Chuyen huong Profile");
                    navigate('/profile');
                }
            } else {
                navigate('/profile');
            }
        }
    }
    // --- LOGIC ĐĂNG KÝ ---
    else {
        try {
            await axios.post('http://localhost:8080/users', form);
            setMessage('Đăng ký thành công! Vui lòng đăng nhập.');
            setIsLogin(true);
            setForm(prev => ({ ...prev, password: '' })); 
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || "Đăng ký thất bại";
            setError(errorMsg);
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
            {!isLogin && (
                <>
                    <input type="text" name="name" placeholder="Họ và tên" value={form.name} onChange={handleChange} className="auth-input" required />
                    <input type="email" name="email" placeholder="Email (Bắt buộc)" value={form.email} onChange={handleChange} className="auth-input" required />
                    <input type="text" name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} className="auth-input" />
                    <input type="text" name="identityCard" placeholder="CMND / CCCD" value={form.identityCard} onChange={handleChange} className="auth-input" />
                    <div style={{marginBottom: '15px'}}>
                        <label style={{marginRight: '10px'}}>Giới tính:</label>
                        <select name="gender" value={form.gender} onChange={handleChange} style={{padding: '5px'}}>
                            <option value="Male">Nam</option>
                            <option value="Female">Nữ</option>
                            <option value="Other">Khác</option>
                        </select>
                    </div>
                    <input type="text" name="city" placeholder="Thành phố" value={form.city} onChange={handleChange} className="auth-input" />
                    <input type="text" name="country" placeholder="Quốc gia" value={form.country} onChange={handleChange} className="auth-input" />
                    <input type="text" name="address" placeholder="Địa chỉ chi tiết" value={form.address} onChange={handleChange} className="auth-input" />
                </>
            )}

            <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} className="auth-input" required />
            <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="auth-input" required />

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