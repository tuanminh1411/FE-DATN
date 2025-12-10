import AdminLayout from "../layout/AdminLayout";

function UserManagementPage({ currentPage, onNavigate, onLogout }) {
  return (
    <AdminLayout
    currentPage={currentPage}
      onNavigate={onNavigate}
      onLogout={onLogout}
      >
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý người dùng & phân quyền</h1>
          <p className="page-subtitle">
            Xem, tìm kiếm và gán quyền sử dụng hệ thống cho người dùng / doanh nghiệp.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn-outline-sm">Tạo người dùng mới</button>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="filter-bar">
        <input
          className="input-search"
          placeholder="Tìm theo email hoặc tên đăng nhập..."
        />
        <select className="select-sm">
          <option>Tất cả vai trò</option>
          <option>Super Admin</option>
          <option>Admin doanh nghiệp</option>
          <option>Support</option>
          <option>Reviewer</option>
        </select>
        <select className="select-sm">
          <option>Tất cả trạng thái</option>
          <option>Đang hoạt động</option>
          <option>Tạm khóa</option>
        </select>
        <button className="btn-primary-sm">Lọc</button>
      </div>

      <div className="grid-2">
        {/* Danh sách user */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Danh sách người dùng</div>
              <div className="panel-subtitle">
                Tổng 128 tài khoản (demo – dữ liệu mock).
              </div>
            </div>
            <span className="badge badge-info">3 đang tạm khóa</span>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Doanh nghiệp</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th width="120">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="user-cell">
                    <div className="avatar-small">A</div>
                    <div>
                      <div className="user-name">admin@system.vn</div>
                      <div className="user-sub">Super Admin</div>
                    </div>
                  </div>
                </td>
                <td>Hệ thống</td>
                <td><span className="tag-role role-super">Super Admin</span></td>
                <td><span className="tag-status active">Đang hoạt động</span></td>
                <td className="table-actions">
                  <button className="btn-link-sm">Sửa</button>
                  <button className="btn-link-sm danger">Khóa</button>
                </td>
              </tr>

              <tr>
                <td>
                  <div className="user-cell">
                    <div className="avatar-small">G</div>
                    <div>
                      <div className="user-name">contact@greenfarm.vn</div>
                      <div className="user-sub">Admin DN</div>
                    </div>
                  </div>
                </td>
                <td>Công ty GreenFarm</td>
                <td><span className="tag-role role-enterprise">Admin DN</span></td>
                <td><span className="tag-status active">Đang hoạt động</span></td>
                <td className="table-actions">
                  <button className="btn-link-sm">Sửa</button>
                  <button className="btn-link-sm danger">Khóa</button>
                </td>
              </tr>

              <tr>
                <td>
                  <div className="user-cell">
                    <div className="avatar-small">S</div>
                    <div>
                      <div className="user-name">support01@system.vn</div>
                      <div className="user-sub">Hỗ trợ</div>
                    </div>
                  </div>
                </td>
                <td>Hệ thống</td>
                <td><span className="tag-role role-support">Support</span></td>
                <td><span className="tag-status locked">Tạm khóa</span></td>
                <td className="table-actions">
                  <button className="btn-link-sm">Sửa</button>
                  <button className="btn-link-sm">Mở khóa</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Vai trò & quyền */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Vai trò & quyền</div>
              <div className="panel-subtitle">
                Định nghĩa quyền truy cập cho từng nhóm người dùng.
              </div>
            </div>
            <button className="btn-outline-sm">Tạo vai trò</button>
          </div>

          <div className="tabs">
            <button className="tab active">Super Admin</button>
            <button className="tab">Admin DN</button>
            <button className="tab">Support</button>
            <button className="tab">Reviewer</button>
          </div>

          <div className="permissions-list">
            <div className="perm-row">
              <div>
                <div className="perm-name">Quản lý người dùng</div>
                <div className="perm-desc">
                  Xem, tạo, sửa, khóa tài khoản người dùng.
                </div>
              </div>
              <div className="perm-actions">
                <span className="perm-pill enabled">Full access</span>
              </div>
            </div>

            <div className="perm-row">
              <div>
                <div className="perm-name">Duyệt doanh nghiệp & sản phẩm</div>
                <div className="perm-desc">
                  Duyệt hồ sơ doanh nghiệp, sản phẩm, lô hàng mới.
                </div>
              </div>
              <div className="perm-actions">
                <span className="perm-pill enabled">Được phép</span>
              </div>
            </div>

            <div className="perm-row">
              <div>
                <div className="perm-name">Giám sát & nhật ký lỗi hệ thống</div>
                <div className="perm-desc">
                  Truy cập dashboard lỗi, xem log kỹ thuật.
                </div>
              </div>
              <div className="perm-actions">
                <span className="perm-pill enabled">Được phép</span>
              </div>
            </div>

            <div className="perm-row">
              <div>
                <div className="perm-name">Cấu hình bảo mật & sao lưu</div>
                <div className="perm-desc">
                  Thay đổi cấu hình bảo mật, lịch backup, khôi phục dữ liệu.
                </div>
              </div>
              <div className="perm-actions">
                <span className="perm-pill enabled">Chỉ Super Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default UserManagementPage;
