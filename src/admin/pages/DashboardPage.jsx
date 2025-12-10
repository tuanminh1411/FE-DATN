import AdminLayout from "../layout/AdminLayout";

function DashboardPage({ currentPage, onNavigate, onLogout }) {
  return (
    <AdminLayout
      currentPage={currentPage}
      onNavigate={onNavigate}
      onLogout={onLogout}
      >
      {/* Hàng trên: tiêu đề + filter */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard tổng quan</h1>
          <p className="page-subtitle">
            Theo dõi tình trạng hệ thống truy xuất nguồn gốc sản phẩm.
          </p>
        </div>
        <div className="page-actions">
          <select className="select-sm">
            <option>Hôm nay</option>
            <option>7 ngày gần đây</option>
            <option>30 ngày gần đây</option>
          </select>
          <button className="btn-outline-sm">Xuất báo cáo</button>
        </div>
      </div>

      {/* Banner trạng thái hệ thống */}
      <div className="status-banner status-ok">
        <div>🟢 Hệ thống đang hoạt động ổn định</div>
        <span className="status-sub">
          Không có sự cố nghiêm trọng trong 24 giờ qua.
        </span>
      </div>

      {/* Hàng KPI */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Doanh nghiệp đang hoạt động</div>
          <div className="kpi-value">128</div>
          <div className="kpi-meta">+12 DN trong 7 ngày</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Sản phẩm đã duyệt</div>
          <div className="kpi-value">3.487</div>
          <div className="kpi-meta">+230 sản phẩm mới</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Lượt quét QR / 24h</div>
          <div className="kpi-value">11.560</div>
          <div className="kpi-meta">+18% so với hôm qua</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Báo cáo nghi vấn đang mở</div>
          <div className="kpi-value">36</div>
          <div className="kpi-meta kpi-danger">Cần xử lý sớm</div>
        </div>
      </div>

      {/* Biểu đồ & tóm tắt (mình làm mock bảng thay cho chart thật) */}
      <div className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Lượt quét QR theo ngày</div>
              <div className="panel-subtitle">
                Thống kê 7 ngày gần nhất (demo)
              </div>
            </div>
          </div>

          <div className="fake-chart">
            <div className="fake-bar" style={{ height: "40%" }} />
            <div className="fake-bar" style={{ height: "65%" }} />
            <div className="fake-bar" style={{ height: "80%" }} />
            <div className="fake-bar" style={{ height: "55%" }} />
            <div className="fake-bar" style={{ height: "70%" }} />
            <div className="fake-bar" style={{ height: "50%" }} />
            <div className="fake-bar" style={{ height: "90%" }} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Tỷ lệ trạng thái doanh nghiệp</div>
              <div className="panel-subtitle">
                Đã xác thực / Chờ duyệt / Tạm khóa
              </div>
            </div>
          </div>
          <ul className="status-list">
            <li>
              <span className="status-dot dot-green" />
              Đã xác thực
              <span className="status-percent">68%</span>
            </li>
            <li>
              <span className="status-dot dot-yellow" />
              Chờ duyệt
              <span className="status-percent">22%</span>
            </li>
            <li>
              <span className="status-dot dot-red" />
              Tạm khóa / vi phạm
              <span className="status-percent">10%</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bảng hoạt động gần đây */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Hoạt động gần đây</div>
          <div className="panel-subtitle">
            Đăng ký doanh nghiệp, sản phẩm, cảnh báo hệ thống.
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Loại sự kiện</th>
              <th>Đối tượng</th>
              <th>Thực hiện bởi</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>10:21 • Hôm nay</td>
              <td>Đăng ký sản phẩm</td>
              <td>Sữa tươi tiệt trùng A2</td>
              <td>DN: GreenMilk</td>
              <td><span className="badge badge-success">Đã duyệt</span></td>
            </tr>
            <tr>
              <td>09:05 • Hôm nay</td>
              <td>Báo cáo nghi vấn</td>
              <td>Lô SP #LH-2025-012</td>
              <td>Người dùng cuối</td>
              <td><span className="badge badge-warning">Đang xử lý</span></td>
            </tr>
            <tr>
              <td>22:40 • Hôm qua</td>
              <td>Backup hệ thống</td>
              <td>Snapshot daily</td>
              <td>Job Scheduler</td>
              <td><span className="badge badge-info">Thành công</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default DashboardPage;
