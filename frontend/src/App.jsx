import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/ui/Navbar";
import Home from "./pages/Home/Home";
import AuthPage from "./pages/AuthPage";
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from "./context/AuthContext";
import Footer  from "./components/ui/Footer";
// Component dùng useLocation để điều khiển Navbar
function AppContent() {
  const location = useLocation(); // lấy url hiện tại

  return (
    <>
      {/* Navbar chỉ hiển thị khi không phải trang /auth */}
      {location.pathname !== "/auth" && <Navbar />}

      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
      {location.pathname !== "/auth" && <Footer />}
    </>
  );
}

function App() {
  return (
    // Bọc toàn bộ app bằng AuthProvider để context hoạt động
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
