import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../api/userApi";

function RegisterPage() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "RECEPTION" // mặc định là Lễ tân
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await registerUser({
        username: form.username,
        password: form.password,
        fullName: form.fullName,
        roles: [form.role]     // Backend thường yêu cầu mảng roles
      });

      alert("✅ Đăng ký thành công!");
      navigate("/login");

    } catch (error) {
      console.error(error);

      if (error.response) {
        alert(error.response.data.message || "Đăng ký thất bại!");
      } else {
        alert("Không kết nối được server!");
      }
    }
  };

  return (
    <div style={{
      width: "450px",
      margin: "80px auto",
      background: "white",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
    }}>

      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        👤 Đăng ký nhân viên
      </h1>

      <form onSubmit={handleSubmit}>

        <div style={{marginBottom: "12px"}}>
          <label>Full name</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            style={{width:"100%", padding:"10px"}}
            required
          />
        </div>

        <div style={{marginBottom: "12px"}}>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            style={{width:"100%", padding:"10px"}}
            required
          />
        </div>

        <div style={{marginBottom: "12px"}}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            style={{width:"100%", padding:"10px"}}
            required
          />
        </div>

        <div style={{marginBottom: "20px"}}>
          <label>Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{width:"100%", padding:"10px"}}
          >
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="RECEPTION">Reception</option>
            <option value="STAFF">Staff</option>
          </select>
        </div>

        <button
          style={{
            width: "100%",
            padding: "12px",
            background: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          Đăng ký
        </button>

      </form>

    </div>
  );
}

export default RegisterPage;
