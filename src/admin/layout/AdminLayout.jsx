function AdminLayout({ children, currentPage, onNavigate, onLogout }) {
  const safeNavigate = onNavigate || (() => {});
  const safeLogout = onLogout || (() => {});

  const getBreadcrumb = () => {
    switch (currentPage) {
      case "users":
        return (
          <>
            Quản lý / <span>Người dùng &amp; phân quyền</span>
          </>
        );
      case "approvals":
        return (
          <>
            Quản lý / <span>Duyệt sản phẩm</span>
          </>
        );
      case "enterprises":
        return (
          <>
            Quản lý / <span>Doanh nghiệp</span>
          </>
        );
      case "enterprise-requests":
        return (
          <>
            Quản lý / <span>Yêu cầu doanh nghiệp</span>
          </>
        );
      default:
        return (
          <>
            Dashboard / <span>Tổng quan</span>
          </>
        );
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">Ad</span>
          <span className="sidebar-title">Admin</span>
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

          <div className="sidebar-section-label">QUẢN LÝ</div>
          <button
            className={
              currentPage === "users"
                ? "sidebar-item sidebar-item-active"
                : "sidebar-item"
            }
            onClick={() => safeNavigate("users")}
          >
            Người dùng &amp; phân quyền
          </button>
          <button
            className={
              currentPage === "enterprises"
                ? "sidebar-item sidebar-item-active"
                : "sidebar-item"
            }
            onClick={() => safeNavigate("enterprises")}
          >
            Doanh nghiệp
          </button>
          <button
            className={
              currentPage === "enterprise-requests"
                ? "sidebar-item sidebar-item-active"
                : "sidebar-item"
            }
            onClick={() => safeNavigate("enterprise-requests")}
          >
            Yêu cầu doanh nghiệp
          </button>
          <button
            className={
              currentPage === "approvals"
                ? "sidebar-item sidebar-item-active"
                : "sidebar-item"
            }
            onClick={() => safeNavigate("approvals")}
          >
            Duyệt sản phẩm
          </button>

          <div className="sidebar-section-label">HỆ THỐNG</div>
          <button className="sidebar-item" disabled>
            Giám sát lỗi
          </button>
          <button className="sidebar-item" disabled>
            Sao lưu &amp; bảo mật
          </button>
          <button className="sidebar-item" disabled>
            Bảo trì &amp; nâng cấp
          </button>
        </nav>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-breadcrumb">{getBreadcrumb()}</div>
          </div>

          <div className="topbar-right">
            <button className="topbar-icon-btn" title="Thông báo">
              🔔
            </button>

            <div className="topbar-user">
              <div className="topbar-avatar">A</div>
              <div className="topbar-user-info">
                <div className="topbar-user-name">Admin System</div>
                <div className="topbar-user-role">Super Admin</div>
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

export default AdminLayout;
