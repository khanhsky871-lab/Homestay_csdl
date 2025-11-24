import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBills } from "../../api/billApi";

function BillListPage() {

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await getAllBills();

        // backend bạn có thể trả dạng res.data.data hoặc res.data
        const data = res.data.data || res.data || [];
        setBills(data);

      } catch (error) {
        console.error(error);
        alert("Không lấy được danh sách hóa đơn");
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  if (loading) return <h2 style={{padding:"40px"}}>Đang tải hóa đơn...</h2>;

  return (
    <div style={{ padding: "30px" }}>

      <h1>DANH SÁCH HÓA ĐƠN</h1>

      <button
        onClick={() => navigate("/bills/create")}
        style={{ marginBottom: "20px", padding:"10px 16px" }}
      >
        ➕ Tạo hóa đơn mới
      </button>

      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Reservation ID</th>
            <th>Khách hàng</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th></th>
          </tr>
        </thead>
        <tbody>

          {bills.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.reservationId}</td>
              <td>{b.fullName || "N/A"}</td>
              <td>{b.total?.toLocaleString() || 0} VNĐ</td>

              <td style={{color: b.status === "PAID" ? "green" : "red"}}>
                {b.status || "UNPAID"}
              </td>

              <td>
                <button onClick={() => navigate(`/bills/${b.id}`)}>
                  Xem chi tiết
                </button>
              </td>
            </tr>
          ))}

        </tbody>
      </table>

    </div>
  );
}

export default BillListPage;
