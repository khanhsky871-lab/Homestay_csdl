import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ===== COMPONENT BẢO VỆ =====
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoutes from "./pages/AdminRoutes.jsx";

// ===== TRANG NGƯỜI DÙNG =====
import MoviesPage from "./pages/MoviesPage.jsx";
import Auth from "./pages/Auth.jsx";
import MovieDetail from "./pages/MovieDetail.jsx";
import Booking from "./pages/Booking.jsx";
import Account from "./pages/Account.jsx";
import NotFound from "./pages/NotFound.jsx";

// ===== TRANG ADMIN =====
import { AdminLayout, AdminDashboard } from "./pages/Admin.jsx";
import MovieManagement from "./pages/admin/MovieManagement.jsx";
import TicketManagement from "./pages/admin/TicketManagement.jsx";
import SeatManagement from "./pages/admin/SeatManagement.jsx";
import ShowtimeManagement from "./pages/admin/ShowtimeManagement.jsx";
import StaffManagement from "./pages/admin/StaffManagement.jsx";
import OrderManagement from "./pages/admin/OrderManagement.jsx";
import TransactionManagement from "./pages/admin/TransactionManagement.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* 🌐 ROUTE CÔNG KHAI */}
            <Route path="/" element={<MoviesPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/movie/:id" element={<MovieDetail />} />

            {/* 🔒 ROUTE USER CẦN ĐĂNG NHẬP */}
            <Route element={<ProtectedRoute />}>
              <Route path="/booking/:showtimeId" element={<Booking />} />
              <Route path="/account" element={<Account />} />
            </Route>

            {/* 🧩 ROUTE ADMIN */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<AdminRoutes />}>
              <Route path="/admin" element={<AdminLayout />}>
                {/* ✅ Dashboard mặc định */}
                <Route index element={<AdminDashboard />} />
                {/* ✅ Các trang quản trị khác */}
                <Route path="movies" element={<MovieManagement />} />
                <Route path="tickets" element={<TicketManagement />} />
                <Route path="seats" element={<SeatManagement />} />
                <Route path="showtimes" element={<ShowtimeManagement />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="transactions" element={<TransactionManagement />} />
              </Route>
            </Route>

            {/* 🚫 ROUTE KHÔNG TỒN TẠI */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
