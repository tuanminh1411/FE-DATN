import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import AdminLayout from "../layout/AdminLayout";

// Cấu hình Base URL
const API_BASE_URL = "http://localhost:5081";

function UserManagementPage({ currentPage, onNavigate, onLogout }) {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- STATE BỘ LỌC (CLIENT SIDE) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // --- STATE MODAL & FORM ---
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [formData, setFormData] = useState({
    hoTen: "",
    email: "",
    dienThoai: "",
    password: "", // Lưu ý: Schema Swagger ảnh cuối không hiện pass, nhưng thường tạo mới cần pass
    kichHoat: true,
    vaiTroIds: [] // Mảng chứa ID các vai trò được chọn
  });

  // --- 1. GỌI API LẤY DỮ LIỆU ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi song song lấy User và Role để tối ưu
      const [usersRes, rolesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/NguoiDung`),
        axios.get(`${API_BASE_URL}/api/VaiTro`)
      ]);

      setUsers(usersRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      alert("Không thể kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. XỬ LÝ FORM & MODAL ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Logic Checkbox chọn quyền
  const handleRoleCheckbox = (roleId) => {
    setFormData((prev) => {
      const isSelected = prev.vaiTroIds.includes(roleId);
      if (isSelected) {
        return { ...prev, vaiTroIds: prev.vaiTroIds.filter(id => id !== roleId) };
      } else {
        return { ...prev, vaiTroIds: [...prev.vaiTroIds, roleId] };
      }
    });
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentUserId(null);
    setFormData({
      hoTen: "", email: "", dienThoai: "", password: "", kichHoat: true, vaiTroIds: []
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setIsEditing(true);
    setCurrentUserId(user.id);

    // --- LOGIC MAPPING QUAN TRỌNG ---
    // User trả về mảng Tên (vd: ["Quản trị hệ thống"]), cần tìm ra ID tương ứng trong danh sách Roles
    // So sánh field 'ten' của Roles với mảng string 'vaiTros' của User
    const existingRoleIds = roles
      .filter(r => user.vaiTros && user.vaiTros.includes(r.ten))
      .map(r => r.id);

    setFormData({
      hoTen: user.hoTen,
      email: user.email,
      dienThoai: user.dienThoai || "",
      password: "", // Không hiển thị lại mật khẩu cũ
      kichHoat: user.kichHoat,
      vaiTroIds: existingRoleIds
    });
    setShowModal(true);
  };

  // --- 3. GỌI API LƯU DỮ LIỆU (TẠO/SỬA) ---
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let targetUserId = currentUserId;

      // Payload cơ bản cho bảng NguoiDung
      const userPayload = {
        hoTen: formData.hoTen,
        email: formData.email,
        dienThoai: formData.dienThoai,
        kichHoat: formData.kichHoat,
        // Nếu API yêu cầu doanhNghiepId, cần thêm vào đây (vd: null hoặc lấy từ context)
        // doanhNghiepId: null 
      };

      if (isEditing) {
        // --- API PUT: Cập nhật thông tin User ---
        await axios.put(`${API_BASE_URL}/api/NguoiDung/${currentUserId}`, {
          id: currentUserId,
          ...userPayload
        });
      } else {
        // --- API POST: Tạo User mới ---
        // Lưu ý: Nếu API hỗ trợ password, thêm vào payload. Nếu không, backend có thể tự sinh.
        const res = await axios.post(`${API_BASE_URL}/api/NguoiDung`, {
            ...userPayload,
            password: formData.password // Thử gửi kèm pass
        });
        // Lấy ID của user vừa tạo từ response để gán quyền
        // Giả sử response trả về object User vừa tạo có trường id
        if (res.data && res.data.id) {
            targetUserId = res.data.id;
        }
      }

      // --- API POST: Gán vai trò (Cho cả Thêm mới và Sửa) ---
      // Endpoint: /api/NguoiDung/GanVaiTro
      if (targetUserId && formData.vaiTroIds.length > 0) {
        await axios.post(`${API_BASE_URL}/api/NguoiDung/GanVaiTro`, {
          nguoiDungId: targetUserId,
          vaiTroIds: formData.vaiTroIds
        });
      }

      alert(isEditing ? "Cập nhật thành công!" : "Tạo mới thành công!");
      setShowModal(false);
      fetchData(); // Load lại bảng
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra. Vui lòng kiểm tra lại thông tin.");
    }
  };

  // --- 4. XỬ LÝ KHÓA/MỞ KHÓA ---
  const handleToggleStatus = async (user) => {
    if (!window.confirm(`Bạn có chắc muốn ${user.kichHoat ? "KHÓA" : "MỞ KHÓA"} tài khoản này?`)) return;
    
    try {
      // API PUT yêu cầu gửi toàn bộ object, chỉ thay đổi kichHoat
      await axios.put(`${API_BASE_URL}/api/NguoiDung/${user.id}`, {
        id: user.id,
        hoTen: user.hoTen,
        email: user.email,
        dienThoai: user.dienThoai,
        kichHoat: !user.kichHoat
      });
      fetchData();
    } catch {
      alert("Lỗi khi cập nhật trạng thái.");
    }
  };

  // --- 5. LOGIC FILTER (CLIENT SIDE) ---
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Tìm kiếm
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        (user.hoTen && user.hoTen.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower));

      // Lọc theo Role (Kiểm tra xem mảng tên vai trò có chứa filterRole không)
      const matchRole = filterRole === "All" || (user.vaiTros && user.vaiTros.includes(filterRole));

      // Lọc theo Status
      let matchStatus = true;
      if (filterStatus === "Active") matchStatus = user.kichHoat === true;
      if (filterStatus === "Locked") matchStatus = user.kichHoat === false;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  // Styles CSS in JS
  const styles = {
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'},
    modal: { backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 600 },
    input: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' },
    checkboxContainer: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', background: '#f9f9f9', padding: '5px 10px', borderRadius: '4px', border: '1px solid #eee' }
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout}>
      
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý người dùng & phân quyền</h1>
          <p className="page-subtitle">Xem, tìm kiếm và gán quyền sử dụng hệ thống.</p>
        </div>
        <div className="page-actions">
          <button className="btn-outline-sm" onClick={handleOpenAdd}>+ Tạo người dùng mới</button>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="filter-bar">
        <input
          className="input-search"
          placeholder="Tìm theo email hoặc tên..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        
        {/* Dropdown Role lấy từ API */}
        <select className="select-sm" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="All">Tất cả vai trò</option>
          {roles.map(r => (
            <option key={r.id} value={r.ten}>{r.ten}</option>
          ))}
        </select>

        <select className="select-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="All">Tất cả trạng thái</option>
          <option value="Active">Đang hoạt động</option>
          <option value="Locked">Tạm khóa</option>
        </select>
      </div>

      {/* Grid Danh sách */}
      <div className="grid-2">
        <div className="panel" style={{ gridColumn: 'span 2' }}>
          <div className="panel-header">
            <div>
              <div className="panel-title">Danh sách người dùng</div>
              <div className="panel-subtitle">Tổng {filteredUsers.length} tài khoản.</div>
            </div>
          </div>

          {loading ? (
            <p style={{padding: '20px', textAlign: 'center'}}>Đang tải dữ liệu...</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th width="120">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar-small">
                          {user.hoTen ? user.hoTen.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="user-name">{user.email}</div>
                          <div className="user-sub">{user.hoTen}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.dienThoai || "---"}</td>
                    <td>
                      {/* Hiển thị tags vai trò */}
                      {user.vaiTros && user.vaiTros.map((roleName, index) => {
                         // Style badge dựa trên tên role (Optional)
                         let badgeClass = "tag-role";
                         if(roleName?.includes("ADMIN") || roleName?.includes("Quản trị")) badgeClass += " role-super";
                         else if(roleName?.includes("DOANH_NGHIEP") || roleName?.includes("doanh nghiệp")) badgeClass += " role-enterprise";
                         
                         return (
                           <span key={index} className={badgeClass} style={{marginRight: '4px'}}>
                             {roleName}
                           </span>
                         )
                      })}
                    </td>
                    <td>
                      {user.kichHoat ? (
                        <span className="tag-status active">Đang hoạt động</span>
                      ) : (
                        <span className="tag-status locked">Đã khóa</span>
                      )}
                    </td>
                    <td className="table-actions">
                      <button className="btn-link-sm" onClick={() => handleOpenEdit(user)}>Sửa</button>
                      <button 
                        className={`btn-link-sm ${user.kichHoat ? 'danger' : ''}`} 
                        onClick={() => handleToggleStatus(user)}
                      >
                        {user.kichHoat ? "Khóa" : "Mở"}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{textAlign:'center', padding: '20px'}}>Không tìm thấy kết quả</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- MODAL THÊM / SỬA --- */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{marginTop: 0}}>{isEditing ? "Cập nhật người dùng" : "Thêm người dùng mới"}</h2>
            
            <form onSubmit={handleSave}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Họ tên</label>
                <input required name="hoTen" style={styles.input} value={formData.hoTen} onChange={handleInputChange} />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input required type="email" name="email" style={styles.input} value={formData.email} onChange={handleInputChange} disabled={isEditing} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Số điện thoại</label>
                <input name="dienThoai" style={styles.input} value={formData.dienThoai} onChange={handleInputChange} />
              </div>

              {!isEditing && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Mật khẩu</label>
                  <input required type="password" name="password" style={styles.input} value={formData.password} onChange={handleInputChange} />
                </div>
              )}

              {/* Phần chọn Vai trò (Checkbox) */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Phân quyền (Vai trò)</label>
                <div style={styles.checkboxContainer}>
                  {roles.map(role => (
                    <label key={role.id} style={styles.checkboxLabel}>
                      <input 
                        type="checkbox"
                        checked={formData.vaiTroIds.includes(role.id)}
                        onChange={() => handleRoleCheckbox(role.id)}
                      />
                      {role.ten}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
                <button type="button" className="btn-outline-sm" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                <button type="submit" className="btn-primary-sm">{isEditing ? "Lưu thay đổi" : "Tạo người dùng"}</button>
              </div>
            </form>

          </div>
        </div>
      )}

    </AdminLayout>
  );
}

export default UserManagementPage;