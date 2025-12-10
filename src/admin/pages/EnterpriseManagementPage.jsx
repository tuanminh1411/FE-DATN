import AdminLayout from "../layout/AdminLayout";

function EnterpriseManagementPage({ currentPage, onNavigate, onLogout }) {
  return (
    <AdminLayout
      currentPage={currentPage}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý doanh nghiệp</h1>
          <p className="page-subtitle">
            Xem, duyệt và quản lý hồ sơ doanh nghiệp tham gia hệ thống truy xuất
            nguồn gốc.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn-outline-sm">Tạo doanh nghiệp thủ công</button>
        </div>
      </div>

      {/* Thanh filter */}
      <div className="filter-bar">
        <input
          className="input-search"
          placeholder="Tìm theo tên doanh nghiệp, MST, email..."
        />
        <select className="select-sm">
          <option>Tất cả trạng thái</option>
          <option>Đang hoạt động</option>
          <option>Chờ xác minh</option>
          <option>Tạm khóa</option>
        </select>
        <button className="btn-primary-sm">Lọc</button>
      </div>

      <div className="grid-2">
        {/* Danh sách doanh nghiệp */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Danh sách doanh nghiệp</div>
              <div className="panel-subtitle">
                3 doanh nghiệp tiêu biểu (demo – dữ liệu mock).
              </div>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Doanh nghiệp</th>
                <th>Mã số thuế</th>
                <th>Liên hệ</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr className="row-highlight">
                <td>
                  <div className="enterprise-cell">
                    <div className="enterprise-logo">G</div>
                    <div>
                      <div className="enterprise-name">GreenMilk JSC</div>
                      <div className="enterprise-sub">
                        Sữa, sản phẩm từ sữa
                      </div>
                    </div>
                  </div>
                </td>
                <td>0312345678</td>
                <td>
                  contact@greenmilk.vn
                  <div className="cell-sub">+84 912 345 678</div>
                </td>
                <td>
                  <span className="tag-status active">Đang hoạt động</span>
                </td>
              </tr>

              <tr>
                <td>
                  <div className="enterprise-cell">
                    <div className="enterprise-logo">X</div>
                    <div>
                      <div className="enterprise-name">Trang trại Xanh Việt</div>
                      <div className="enterprise-sub">Rau củ quả hữu cơ</div>
                    </div>
                  </div>
                </td>
                <td>0409876543</td>
                <td>
                  info@xanhvietfarm.vn
                  <div className="cell-sub">+84 988 888 999</div>
                </td>
                <td>
                  <span className="tag-status pending">Chờ xác minh</span>
                </td>
              </tr>

              <tr>
                <td>
                  <div className="enterprise-cell">
                    <div className="enterprise-logo">P</div>
                    <div>
                      <div className="enterprise-name">
                        Nông trại Phú An Foods
                      </div>
                      <div className="enterprise-sub">
                        Thịt gia súc, gia cầm
                      </div>
                    </div>
                  </div>
                </td>
                <td>0201122334</td>
                <td>
                  support@phuanfoods.vn
                  <div className="cell-sub">+84 973 456 222</div>
                </td>
                <td>
                  <span className="tag-status locked">Tạm khóa</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Chi tiết doanh nghiệp (doanh nghiệp đang chọn) */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Hồ sơ doanh nghiệp – GreenMilk JSC</div>
              <div className="panel-subtitle">
                MST: 0312345678 • Tỉnh/TP: TP. Hồ Chí Minh
              </div>
            </div>
            <span className="tag-status active">Đang hoạt động</span>
          </div>

          <div className="enterprise-detail-grid">
            <div className="detail-block">
              <div className="detail-label">Thông tin liên hệ</div>
              <div className="detail-value">
                - Người đại diện: Nguyễn Văn An – Giám đốc <br />
                - Email: contact@greenmilk.vn <br />
                - Điện thoại: +84 912 345 678 <br />
                - Địa chỉ: 123 Đường Số 1, Quận 7, TP. Hồ Chí Minh
              </div>
            </div>

            <div className="detail-block">
              <div className="detail-label">Thông tin hệ thống</div>
              <div className="detail-value">
                - Ngày tham gia hệ thống: 10/01/2025 <br />
                - Số sản phẩm đã đăng ký: 24 <br />
                - Số lô hàng đang hoạt động: 58 <br />
                - Tổng lượt quét QR: 128.450
              </div>
            </div>

            <div className="detail-block">
              <div className="detail-label">Giấy tờ & chứng nhận</div>
              <div className="detail-value">
                - Giấy phép kinh doanh: Đã tải lên và xác minh <br />
                - Chứng nhận VSATTP: Còn hiệu lực đến 12/2026 <br />
                - Các chứng chỉ khác: ISO 22000:2018, HACCP
              </div>
            </div>

            <div className="detail-block">
              <div className="detail-label">Ghi chú nội bộ</div>
              <textarea
                className="note-input"
                placeholder="Nhập ghi chú cho doanh nghiệp (chỉ nội bộ admin nhìn thấy)..."
                rows={3}
              />
            </div>

            <div className="enterprise-actions-row">
              <button className="btn-ghost-danger">Tạm khóa doanh nghiệp</button>
              <button className="btn-primary">Lưu thay đổi</button>
            </div>

            <div className="hint-text">
              Khi tạm khóa, tất cả tài khoản thuộc doanh nghiệp này sẽ không thể
              tạo lô hàng / QR mới, nhưng người dùng cuối vẫn xem được thông tin
              các sản phẩm đã phát hành trước đó.
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default EnterpriseManagementPage;
