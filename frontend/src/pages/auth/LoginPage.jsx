import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/loginApi";

function LoginPage() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Gọi API đăng nhập
      const res = await login({
        username,
        password
      });

      // Vì backend có thể trả về theo 2 kiểu:
      // 1. { data: { accessToken, refreshToken, roles... }}
      // 2. { accessToken, refreshToken, roles... }
      const data = res.data.data || res.data;

      const { accessToken, refreshToken, roles, userId } = data;

      // Lưu thông tin đăng nhập
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("roles", JSON.stringify(roles));
      localStorage.setItem("userId", userId);

      alert("✅ Đăng nhập thành công!");

      // Điều hướng theo role
      if (roles.includes("ADMIN")) {
        navigate("/report");    // hoặc /dashboard sau này bạn làm
      }
      else if (roles.includes("STAFF")) {
        navigate("/bills");
      }
      else {
        navigate("/");
      }

    } catch (error) {
      console.error(error);

      if (error.response) {
        alert(error.response.data.message || "Sai tài khoản hoặc mật khẩu!");
      } else {
        alert("Không kết nối được server!");
      }
    }
  };

  return (
    <div style={{
      width: "400px",
      margin: "80px auto",
      background: "white",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
    }}>

      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        🔐 Đăng nhập hệ thống
      </h1>

      <form onSubmit={handleSubmit}>

        <div style={{ marginBottom: "15px" }}>
          <label>Username</label>
          <input
            type="text"
            style={{ width: "100%", padding: "10px" }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>Password</label>
          <input
            type="password"
            style={{ width: "100%", padding: "10px" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          Đăng nhập
        </button>

      </form>

    </div>
  );
}

export default LoginPage;
