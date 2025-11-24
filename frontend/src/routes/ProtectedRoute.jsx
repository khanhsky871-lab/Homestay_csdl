import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowRoles }) {

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if(!token) return <Navigate to="/login" />;

  if(!allowRoles.includes(role)){
    alert("Bạn không có quyền truy cập trang này!");
    return <Navigate to="/bills" />
  }

  return children;
}

export default ProtectedRoute;
