import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBill } from "../../api/billApi";

function BillCreatePage() {

  const [reservationId, setReservationId] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await createBill({
        reservationId: parseInt(reservationId)
      });

      alert("✅ Tạo hóa đơn thành công!");

      const billId = res.data.data?.id || res.data.id;
      navigate(`/bills/${billId}`);

    } catch (error) {
      console.error(error);
      alert("Tạo hóa đơn thất bại!");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>🧾 Tạo hóa đơn</h1>

      <form onSubmit={handleSubmit}>

        <div style={{marginBottom:"12px"}}>
          <label>Reservation ID</label>
          <input
            type="number"
            value={reservationId}
            onChange={(e) => setReservationId(e.target.value)}
            style={{padding:"10px", width:"300px"}}
            required
          />
        </div>

        <button style={{ padding:"10px 20px" }}>
          ➕ Tạo hóa đơn
        </button>

      </form>

    </div>
  );
}

export default BillCreatePage;
