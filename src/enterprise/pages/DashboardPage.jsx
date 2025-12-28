//import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function EnterpriseDashboardPage() {
  // Dữ liệu lượt quét QR theo ngày
  const scanData = [
    { date: "T2", scans: 120 },
    { date: "T3", scans: 200 },
    { date: "T4", scans: 150 },
    { date: "T5", scans: 280 },
    { date: "T6", scans: 220 },
    { date: "T7", scans: 356 },
    { date: "CN", scans: 180 },
  ];

  // Dữ liệu sản phẩm & lô hàng
  const productData = [
    { name: "Sản phẩm hoạt động", value: 12 },
    { name: "Lô hàng đang bán", value: 7 },
    { name: "Sản phẩm tạm dừng", value: 5 },
  ];

  // Dữ liệu báo cáo khách hàng
  const reportData = [
    { name: "Chờ xử lý", value: 3, color: "#ef4444" },
    { name: "Đang xử lý", value: 2, color: "#f59e0b" },
    { name: "Đã giải quyết", value: 8, color: "#10b981" },
  ];

  const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4"];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard doanh nghiệp</h1>
          <p className="page-subtitle">
            Theo dõi tổng quan sản phẩm, lô hàng và lượt quét QR của doanh nghiệp.
          </p>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Sản phẩm đang hoạt động</div>
          <div className="kpi-value">12</div>
          <div className="kpi-meta">Demo data</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Lô hàng đang bán</div>
          <div className="kpi-value">7</div>
          <div className="kpi-meta">Demo data</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Lượt quét QR hôm nay</div>
          <div className="kpi-value">356</div>
          <div className="kpi-meta">Demo data</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Báo cáo khách hàng đang mở</div>
          <div className="kpi-value">3</div>
          <div className="kpi-meta kpi-danger">Cần xử lý</div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="charts-grid">
        {/* BIỂU ĐỒ LƯỢT QUÉT QR THEO NGÀY */}
        <div className="chart-card">
          <h3>Lượt quét QR trong tuần</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scanData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="scans"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Lượt quét"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* BIỂU ĐỒ SẢN PHẨM & LÔ HÀNG */}
        <div className="chart-card">
          <h3>Sản phẩm & Lô hàng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8b5cf6" name="Số lượng" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* BIỂU ĐỒ BÁO CÁO KHÁCH HÀNG */}
        <div className="chart-card">
          <h3>Trạng thái báo cáo khách hàng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {reportData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .chart-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .chart-card h3 {
          margin: 0 0 20px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
      `}</style>
    </>
  );
}

export default EnterpriseDashboardPage;
