import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/ui/Navbar";
import Home from "./pages/Home/Home";
import AuthPage from "./pages/AuthPage";
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from "./pages/AdminDashboard"; 
import { AuthProvider } from "./context/AuthContext";
import Footer  from "./components/ui/Footer";
import EmployeeDashboard from './pages/EmployeeDashboard';

// Component dùng useLocation để điều khiển Navbar
function AppContent() {
  const location = useLocation(); 

  // 👇 2. Logic: Ẩn Navbar/Footer nếu đang ở trang "/auth" HOẶC trang bắt đầu bằng "/admin"
  const isHiddenPage = location.pathname === "/auth" || location.pathname.startsWith("/admin");

  return (
    <>
      {/* Chỉ hiển thị Navbar khi KHÔNG PHẢI trang ẩn */}
      {!isHiddenPage && <Navbar />}

      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* 👇 3. THÊM ĐƯỜNG DẪN CHO ADMIN */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        </Routes>
      </div>

      {/* Chỉ hiển thị Footer khi KHÔNG PHẢI trang ẩn */}
      {!isHiddenPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;