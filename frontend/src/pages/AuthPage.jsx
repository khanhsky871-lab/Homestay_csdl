import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './AuthPage.css';     // ⬅ THÊM DÒNG NÀY

const AuthPage = () => {
  const { login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = isLogin
      ? await login(form.email, form.password)
      : await register(form.name, form.email, form.password);

    if (!res.success) setError(res.message);
  };

  return (
    <div className="auth-container">
        <h1><Link className='logo-link'to="/">Myhomestay</Link></h1>
        <div className="auth-card">
          <h2>{isLogin ? 'Login' : 'Register'}</h2>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className="auth-input"
              />
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="auth-input"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="auth-input"
            />

            <button type="submit" className="auth-button">
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          <p className="auth-toggle">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Register' : 'Login'}
            </span>
          </p>
        </div>
    </div>
  );
};

export default AuthPage;
