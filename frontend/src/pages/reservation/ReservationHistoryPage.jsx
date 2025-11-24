import { useEffect, useState } from "react";
import { getAllReservations } from "../../api/reservationApi";

function ReservationHistoryPage() {

  const [reservations, setReservations] = useState([]);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const res = await getAllReservations();
        setReservations(res.data);
      } catch (error) {
        console.error(error);
        alert("Không lấy được lịch sử đặt phòng");
      }
    }

    fetchData();

  }, []);

  return (
    <div style={{ padding: "30px" }}>

      <h1>LỊCH SỬ ĐẶT PHÒNG</h1>

      <table border="1" cellPadding="10" width="100%" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Khách hàng</th>
            <th>Phòng</th>
            <th>Ngày nhận</th>
            <th>Ngày trả</th>
            <th>Trạng thái</th>
            <th>Thanh toán</th>
          </tr>
        </thead>

        <tbody>
          {reservations.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.user?.name || "N/A"}</td>
              <td>{r.room?.name || "N/A"}</td>
              <td>{r.checkInDate}</td>
              <td>{r.checkOutDate}</td>
              <td>{r.status}</td>
              <td
                style={{
                  color: r.paymentStatus === "Paid" ? "green" : "red",
                  fontWeight: "bold"
                }}
              >
                {r.paymentStatus}
              </td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}

export default ReservationHistoryPage;
