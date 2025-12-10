// src/enterprise/layout/EnterpriseLayout.jsx
function EnterpriseLayout({ children, currentPage, onNavigate, onLogout, user }) {
  const safeNavigate = onNavigate || (() => {});
  const safeLogout = onLogout || (() => {});

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

  const displayName = user?.name || "Doanh nghiệp";

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
              Doanh nghiệp / <span>{getBreadcrumb()}</span>
            </div>
          </div>

          <div className="topbar-right">
            <button className="topbar-icon-btn" title="Thông báo">
              🔔
            </button>

            <div className="topbar-user">
              <div className="topbar-avatar">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="topbar-user-info">
                <div className="topbar-user-name">{displayName}</div>
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
