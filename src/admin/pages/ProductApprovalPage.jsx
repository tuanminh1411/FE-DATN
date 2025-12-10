import AdminLayout from "../layout/AdminLayout";

function ProductApprovalPage({ currentPage, onNavigate, onLogout }) {
  return (
    <AdminLayout
      currentPage={currentPage}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Duyệt đăng ký sản phẩm</h1>
          <p className="page-subtitle">
            Kiểm tra hồ sơ sản phẩm, tiêu chuẩn, kết quả kiểm nghiệm trước khi
            cho phép doanh nghiệp phát hành QR.
          </p>
        </div>
        <div className="page-actions">
          <select className="select-sm">
            <option>Tất cả trạng thái</option>
            <option>Chờ duyệt</option>
            <option>Đã duyệt</option>
            <option>Bị từ chối</option>
          </select>
          <select className="select-sm">
            <option>7 ngày gần đây</option>
            <option>30 ngày gần đây</option>
            <option>Tất cả</option>
          </select>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="filter-bar">
        <input
          className="input-search"
          placeholder="Tìm theo tên sản phẩm, mã sản phẩm, tên doanh nghiệp..."
        />
        <button className="btn-primary-sm">Tìm</button>
      </div>

      <div className="grid-2">
        {/* Danh sách yêu cầu */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Yêu cầu đăng ký sản phẩm</div>
              <div className="panel-subtitle">
                5 yêu cầu chờ duyệt (demo – dữ liệu mock).
              </div>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Doanh nghiệp</th>
                <th>Mã / Lô</th>
                <th>Gửi ngày</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr className="row-highlight">
                <td>
                  Sữa tươi tiệt trùng A2
                  <div className="cell-sub">Dung tích 1L • Hộp giấy</div>
                </td>
                <td>GreenMilk JSC</td>
                <td>
                  SP-A2-01
                  <div className="cell-sub">Lô: LH-2025-001</div>
                </td>
                <td>19/11/2025</td>
                <td>
                  <span className="badge badge-warning">Chờ duyệt</span>
                </td>
              </tr>

              <tr>
                <td>
                  Rau cải baby hữu cơ
                  <div className="cell-sub">Đóng gói 500g</div>
                </td>
                <td>Trang trại Xanh Việt</td>
                <td>
                  RC-OC-500
                  <div className="cell-sub">Lô: OC-2025-023</div>
                </td>
                <td>18/11/2025</td>
                <td>
                  <span className="badge badge-success">Đã duyệt</span>
                </td>
              </tr>

              <tr>
                <td>
                  Thịt gà làm sẵn – đông lạnh
                  <div className="cell-sub">Đóng gói 1kg</div>
                </td>
                <td>Nông trại Phú An</td>
                <td>
                  GA-DL-01
                  <div className="cell-sub">Lô: GA-2025-005</div>
                </td>
                <td>17/11/2025</td>
                <td>
                  <span className="badge badge-danger">Bị từ chối</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Chi tiết yêu cầu (demo cho dòng đang chọn) */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                Chi tiết yêu cầu – Sữa tươi tiệt trùng A2
              </div>
              <div className="panel-subtitle">
                Doanh nghiệp: GreenMilk JSC • Mã sản phẩm: SP-A2-01 • Lô:
                LH-2025-001
              </div>
            </div>
          </div>

          <div className="product-detail-grid">
            <div className="product-main-info">
              <div className="detail-block">
                <div className="detail-label">Thông tin chính</div>
                <div className="detail-value">
                  - Dung tích: 1L <br />
                  - Quy cách: Hộp giấy <br />
                  - Hạn sử dụng đề xuất: 6 tháng
                </div>
              </div>

              <div className="detail-block">
                <div className="detail-label">Tiêu chuẩn áp dụng</div>
                <div className="detail-value">
                  - ISO 22000:2018 <br />
                  - HACCP cho dây chuyền đóng gói <br />
                  - Chứng nhận hữu cơ VietGAP
                </div>
              </div>

              <div className="detail-block">
                <div className="detail-label">Kết quả kiểm nghiệm</div>
                <div className="detail-value">
                  - Không phát hiện kháng sinh vượt ngưỡng <br />
                  - Vi sinh đạt chuẩn Bộ Y tế <br />
                  - Đính kèm file PDF (bản scan)
                </div>
              </div>
            </div>

            <div className="product-actions">
              <div className="detail-block">
                <div className="detail-label">Ghi chú nội bộ</div>
                <textarea
                  className="note-input"
                  placeholder="Nhập ghi chú cho lần duyệt này (không gửi cho doanh nghiệp)..."
                  rows={4}
                />
              </div>

              <div className="action-row">
                <button className="btn-ghost-danger">Từ chối</button>
                <button className="btn-primary">Duyệt & cho phép tạo QR</button>
              </div>

              <div className="hint-text">
                Sau khi duyệt, hệ thống sẽ cho phép doanh nghiệp tạo mã QR cho
                lô hàng LH-2025-001 và ghi nhận vào nhật ký hệ thống.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default ProductApprovalPage;
