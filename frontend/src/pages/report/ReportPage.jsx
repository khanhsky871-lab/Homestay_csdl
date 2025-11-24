import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  getBills,
  getReservations,
  getRooms,
  getUsers,
  getServices
} from "../../api/reportApi";

function ReportPage() {

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueByRoom, setRevenueByRoom] = useState({});
  const [revenueByEmployee, setRevenueByEmployee] = useState({});
  const [roomUsageRate, setRoomUsageRate] = useState([]);
  const [employeePerformance, setEmployeePerformance] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchReports = async () => {
      try {
        const [billRes, reservationRes, roomRes, userRes, serviceRes] = await Promise.all([
          getBills(),
          getReservations(),
          getRooms(),
          getUsers(),
          getServices()
        ]);

        const bills = billRes.data?.data || billRes.data || [];
        const reservations = reservationRes.data?.data?.content || reservationRes.data?.data || [];
        const rooms = roomRes.data?.data?.content || roomRes.data?.data || [];
        const users = userRes.data?.data || userRes.data || [];

        // =========================
        // 1. TỔNG DOANH THU
        // =========================
        const total = bills.reduce((sum, b) => sum + (b.total || 0), 0);
        setTotalRevenue(total);

        // =========================
        // 2. DOANH THU THEO PHÒNG
        // =========================
        const roomRevenue = {};
        bills.forEach(b => {
          if (b.roomName) {
            roomRevenue[b.roomName] = (roomRevenue[b.roomName] || 0) + b.total;
          }
        });
        setRevenueByRoom(roomRevenue);

        // =========================
        // 3. DOANH THU THEO NHÂN VIÊN
        // =========================
        const employeeRevenue = {};
        bills.forEach(b => {
          const emp = users.find(u => u.id === b.employeeId);
          const name = emp ? emp.name : `ID ${b.employeeId}`;

          employeeRevenue[name] = (employeeRevenue[name] || 0) + b.total;
        });
        setRevenueByEmployee(employeeRevenue);

        // =========================
        // 4. TỶ LỆ SỬ DỤNG PHÒNG
        // =========================
        const roomCount = {};
        reservations.forEach(r => {
          roomCount[r.roomId] = (roomCount[r.roomId] || 0) + 1;
        });

        const totalReservation = reservations.length;

        const usage = rooms.map(room => {
          const count = roomCount[room.id] || 0;
          const rate = totalReservation === 0
            ? 0
            : ((count / totalReservation) * 100).toFixed(2);

          return { roomName: room.name, usageRate: rate };
        });

        setRoomUsageRate(usage);

        // =========================
        // 5. HIỆU SUẤT NHÂN VIÊN
        // =========================
        const employeeCount = {};

        reservations.forEach(r => {
          const emp = users.find(u => u.id === r.employeeId);
          const name = emp ? emp.name : `ID ${r.employeeId}`;

          employeeCount[name] = (employeeCount[name] || 0) + 1;
        });

        const performance = Object.keys(employeeCount).map(name => ({
          employeeName: name,
          totalRevenue: employeeCount[name]
        }));

        setEmployeePerformance(performance);

      } catch (error) {
        console.error(error);
        alert("Không thể tải dữ liệu báo cáo");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // =========================
  // XUẤT EXCEL
  // =========================
  const exportToExcel = () => {

    const data = [
      { "THỐNG KÊ": "Tổng doanh thu", "GIÁ TRỊ": totalRevenue },

      ...Object.entries(revenueByRoom).map(([room, revenue]) => ({
        "THỐNG KÊ": `Doanh thu phòng ${room}`,
        "GIÁ TRỊ": revenue
      })),

      ...Object.entries(revenueByEmployee).map(([emp, revenue]) => ({
        "THỐNG KÊ": `Doanh thu nhân viên ${emp}`,
        "GIÁ TRỊ": revenue
      })),

      ...roomUsageRate.map(r => ({
        "THỐNG KÊ": `Tỷ lệ sử dụng ${r.roomName}`,
        "GIÁ TRỊ": `${r.usageRate}%`
      })),

      ...employeePerformance.map(e => ({
        "THỐNG KÊ": `Hiệu suất ${e.employeeName}`,
        "GIÁ TRỊ": e.totalRevenue
      }))
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCao");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, "bao_cao_homestay.xlsx");
  };

  if (loading) {
    return <h2 style={{ padding: "40px" }}>Đang tải dữ liệu...</h2>;
  }

  const cardStyle = {
    padding: "20px",
    background: "white",
    borderRadius: "10px",
    marginBottom: "30px"
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse"
  };

  const thStyle = {
    background: "#1976d2",
    color: "white",
    padding: "10px"
  };

  const tdStyle = {
    padding: "10px",
    borderBottom: "1px solid #ddd"
  };

  return (
    <div style={{ padding: "40px", background: "#f4f6f9", minHeight: "100vh" }}>

      <h1>📊 BÁO CÁO HOMESTAY</h1>

      <button onClick={exportToExcel}
        style={{
          padding: "10px 20px",
          marginBottom: "30px",
          background: "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}>
        📥 Xuất Excel
      </button>

      {/* Tổng doanh thu */}
      <div style={{ ...cardStyle, background: "#1976d2", color: "white" }}>
        <h2>💰 Tổng doanh thu</h2>
        <h1>{totalRevenue.toLocaleString()} VNĐ</h1>
      </div>

      {/* Doanh thu theo phòng */}
      <div style={cardStyle}>
        <h3>Doanh thu theo phòng</h3>
        <table style={tableStyle}>
          <thead>
            <tr><th style={thStyle}>Phòng</th><th style={thStyle}>Doanh thu</th></tr>
          </thead>
          <tbody>
            {Object.keys(revenueByRoom).map(room => (
              <tr key={room}>
                <td style={tdStyle}>{room}</td>
                <td style={tdStyle}>{revenueByRoom[room].toLocaleString()} VNĐ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Doanh thu theo nhân viên */}
      <div style={cardStyle}>
        <h3>Doanh thu theo nhân viên</h3>
        <table style={tableStyle}>
          <thead>
            <tr><th style={thStyle}>Nhân viên</th><th style={thStyle}>Doanh thu</th></tr>
          </thead>
          <tbody>
            {Object.keys(revenueByEmployee).map(emp => (
              <tr key={emp}>
                <td style={tdStyle}>{emp}</td>
                <td style={tdStyle}>{revenueByEmployee[emp].toLocaleString()} VNĐ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tỷ lệ sử dụng phòng */}
      <div style={cardStyle}>
        <h3>Tỷ lệ sử dụng phòng (%)</h3>
        <table style={tableStyle}>
          <thead>
            <tr><th style={thStyle}>Phòng</th><th style={thStyle}>Tỷ lệ</th></tr>
          </thead>
          <tbody>
            {roomUsageRate.map((r, i) => (
              <tr key={i}>
                <td style={tdStyle}>{r.roomName}</td>
                <td style={tdStyle}>{r.usageRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hiệu suất nhân viên */}
      <div style={cardStyle}>
        <h3>Hiệu suất nhân viên</h3>
        <table style={tableStyle}>
          <thead>
            <tr><th style={thStyle}>Nhân viên</th><th style={thStyle}>Số lượt</th></tr>
          </thead>
          <tbody>
            {employeePerformance.map((e, i) => (
              <tr key={i}>
                <td style={tdStyle}>{e.employeeName}</td>
                <td style={tdStyle}>{e.totalRevenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default ReportPage;
