// src/enterprise/layout/EnterpriseLayout.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

// Cấu hình Base URL
const API_BASE_URL = "http://localhost:5081";

function EnterpriseLayout({ children, currentPage, onNavigate, onLogout }) {
  const safeNavigate = onNavigate || (() => {});
  const safeLogout = onLogout || (() => {});

  // State lưu tên doanh nghiệp
  const [enterpriseName, setEnterpriseName] = useState("Đang tải...");

  // Effect: Gọi API lấy thông tin doanh nghiệp
  useEffect(() => {
    const fetchEnterpriseInfo = async () => {
      const enterpriseId = localStorage.getItem("currentEnterpriseId");
      
      if (enterpriseId) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/AdminDoanhNghiep/${enterpriseId}`);
          // Dựa vào hình ảnh JSON bạn gửi, dữ liệu trả về có trường "ten"
          // Kiểm tra xem dữ liệu nằm ở response.data hay response.data.data
          const data = response.data; 
          
          if (data && data.ten) {
            setEnterpriseName(data.ten);
          } else {
            setEnterpriseName("Doanh nghiệp");
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin doanh nghiệp:", error);
          setEnterpriseName("Doanh nghiệp");
        }
      } else {
        setEnterpriseName("Khách");
      }
    };

    fetchEnterpriseInfo();
  }, []);

  const getBreadcrumb = () => {
    switch (currentPage) {
      case "products":
        return "Sản phẩm";
      case "batches":
        return "Lô hàng & QR";
      case "supply":
        return "Chuỗi cung ứng";
      case "stores":
        return "Chuỗi cửa hàng";
      case "reports":
        return "Báo cáo & tồn kho";
      case "customerReports":
        return "Báo cáo từ khách hàng";
      default:
        return "Tổng quan";
    }
  };

  // Lấy chữ cái đầu tiên để làm Avatar
  const avatarLetter = enterpriseName ? enterpriseName.charAt(0).toUpperCase() : "D";

  return (
    <div className="app-shell enterprise-shell">
      {/* Sidebar */}
      <aside className="sidebar enterprise-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">En</span>
          <span className="sidebar-title">Enterprise Portal</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">TỔNG QUAN</div>
          <button
            className={
              currentPage === "dashboard"
                ? "sidebar-item sidebar-item-active"
                : "sidebar-item"
            }
            onClick={() => safeNavigate("dashboard")}
          >
            Dashboard tổng quan
          </button>

          <div className="sidebar-section-label">TÁC NGHIỆP</div>
          <button
            className={
              currentPage === "products"
                ? "sidebar-item sidebar-item-active"
                : "sidebar-item"
            }
            onClick={() => safeNavigate("products")}
          >
            Sản phẩm
          </button>
          <button
            className={
              currentPage === "batches"
                ? "sidebar-item sidebar-item-active"
                : "sidebar-item"
            }
            onClick={() => safeNavigate("batches")}
          >
            Lô hàng &amp; QR
          </button>
          <button
            className={
              currentPage === "supply"
                ? "sidebar-item sidebar-item-active"
                : "sidebar-item"
            }
            onClick={() => safeNavigate("supply")}
          >
            Chuỗi cung ứng
          </button>
          <button
            className={
              currentPage === "stores"
                ? "sidebar-item sidebar-item-active"
                : "sidebar-item"
            }
            onClick={() => safeNavigate("stores")}
          >
            Chuỗi cửa hàng
          </button>

          <div className="sidebar-section-label">BÁO CÁO</div>
          <button
            className={
              currentPage === "reports"
                ? "sidebar-item sidebar-item-active"
                : "sidebar-item"
            }
            onClick={() => safeNavigate("reports")}
          >
            Báo cáo & tồn kho
          </button>
          <button
            className={
              currentPage === "customerReports"
                ? "sidebar-item sidebar-item-active"
                : "sidebar-item"
            }
            onClick={() => safeNavigate("customerReports")}
          >
            Báo cáo từ khách hàng
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-breadcrumb">
              {/* Hiển thị tên doanh nghiệp ở Breadcrumb luôn cho đồng bộ */}
              {enterpriseName} / <span>{getBreadcrumb()}</span>
            </div>
          </div>

          <div className="topbar-right">
            <button className="topbar-icon-btn" title="Thông báo">
              🔔
            </button>

            <div className="topbar-user">
              <div className="topbar-avatar">
                {avatarLetter}
              </div>
              <div className="topbar-user-info">
                {/* Hiển thị tên doanh nghiệp lấy từ API */}
                <div className="topbar-user-name">{enterpriseName}</div>
                <div className="topbar-user-role">Tài khoản doanh nghiệp</div>
              </div>
            </div>

            <button className="btn-logout" onClick={safeLogout}>
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

export default EnterpriseLayout;