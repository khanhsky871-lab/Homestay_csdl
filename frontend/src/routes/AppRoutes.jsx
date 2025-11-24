import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import BillListPage from "../pages/bill/BillListPage";
import BillDetailPage from "../pages/bill/BillDetailPage";
import ReportPage from "../pages/report/ReportPage";
import ProtectedRoute from "./ProtectedRoute";
import ReservationHistoryPage from "../pages/reservation/ReservationHistoryPage";
import BillCreatePage from "../pages/bill/BillCreatePage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reservations" element={<ReservationHistoryPage />} />
        <Route path="/bills/create" element={<BillCreatePage />} />
        {/* BILLS - mọi role được dùng */}
        <Route path="/bills" element={
          <ProtectedRoute allowRoles={["ADMIN","MANAGER","RECEPTION"]}>
            <BillListPage />
          </ProtectedRoute>
        }/>

        <Route path="/bills/:id" element={
          <ProtectedRoute allowRoles={["ADMIN","MANAGER","RECEPTION"]}>
            <BillDetailPage />
          </ProtectedRoute>
        }/>

        {/* REPORT - chỉ ADMIN, MANAGER */}
        <Route path="/report" element={
          <ProtectedRoute allowRoles={["ADMIN","MANAGER"]}>
            <ReportPage />
          </ProtectedRoute>
        }/>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
