import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBillDetail, addBillDetail } from "../../api/billApi";

function BillDetailPage() {

  const { id } = useParams();

  const [bill, setBill] = useState(null);
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    serviceId: "",
    quantity: 1
  });

  const fetchBill = async () => {
    try {
      const res = await getBillDetail(id);
      const data = res.data.data || res.data;

      setBill(data.bill);
      setServices(data.details || []);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBill();
  }, [id]);

  const handleAddService = async (e) => {
    e.preventDefault();

    try {
      await addBillDetail(id, {
        serviceId: Number(newService.serviceId),
        quantity: Number(newService.quantity)
      });

      alert("✅ Đã thêm dịch vụ");
      setNewService({ serviceId: "", quantity: 1 });

      fetchBill(); // load lại

    } catch (error) {
      console.error(error);
      alert("❌ Không thêm được dịch vụ");
    }
  };

  if (!bill) return <h2>Đang tải...</h2>;

  const total = services.reduce((sum, s) =>
    sum + s.price * s.quantity
  , 0);

  return (
    <div style={{ padding: "30px" }}>

      <h1>CHI TIẾT HÓA ĐƠN #{bill.id}</h1>

      <p><b>Khách hàng:</b> {bill.fullName}</p>
      <p><b>Reservation:</b> {bill.reservationId}</p>

      <h3>Dịch vụ</h3>

      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>Dịch vụ</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s, i) => (
            <tr key={i}>
              <td>{s.serviceName}</td>
              <td>{s.price.toLocaleString()}</td>
              <td>{s.quantity}</td>
              <td>{(s.price * s.quantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ textAlign: "right" }}>
        Tổng tiền: {total.toLocaleString()} VNĐ
      </h2>

      <hr />

      <h3>➕ Thêm dịch vụ vào hóa đơn</h3>

      <form onSubmit={handleAddService}>

        <input
          placeholder="Service ID"
          value={newService.serviceId}
          onChange={(e) =>
            setNewService({ ...newService, serviceId: e.target.value })
          }
          style={{ padding: "8px", marginRight: "10px" }}
        />

        <input
          type="number"
          min="1"
          value={newService.quantity}
          onChange={(e) =>
            setNewService({ ...newService, quantity: e.target.value })
          }
          style={{ padding: "8px", marginRight: "10px" }}
        />

        <button>Thêm</button>

      </form>

    </div>
  );
}

export default BillDetailPage;
