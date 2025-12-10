function EnterpriseDashboardPage() {
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
    </>
  );
}

export default EnterpriseDashboardPage;
