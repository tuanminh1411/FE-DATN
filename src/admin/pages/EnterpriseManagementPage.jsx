import React, { useState, useEffect } from "react";
import AdminLayout from "../layout/AdminLayout";
import axios from "axios";

// Cấu hình base URL
const API_BASE_URL = "http://localhost:5081";

function EnterpriseManagementPage({ currentPage, onNavigate, onLogout }) {
  // --- State quản lý dữ liệu ---
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(false);

  // State thông báo (Notification)
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  // State bộ lọc và tìm kiếm
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, ACTIVE, PENDING
  const [searchTerm, setSearchTerm] = useState("");

  // State doanh nghiệp đang chọn
  const [selectedEnterprise, setSelectedEnterprise] = useState(null);
  const [noteInput, setNoteInput] = useState("");

  // --- Hàm hiển thị thông báo tự tắt sau 3s ---
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // --- 1. Gọi API lấy danh sách ---
  const fetchEnterprises = async () => {
    setLoading(true); // Bắt đầu tải -> set loading = true
    try {
      let url = `${API_BASE_URL}/api/YeuCauDangKyDn/Admin`;
      
      if (filterStatus === 'PENDING') {
          url = `${API_BASE_URL}/api/YeuCauDangKyDn`;
      }

      const response = await axios.get(url);
      let data = response.data || [];

      if (filterStatus !== "ALL") {
        data = data.filter(item => item.trangThai === filterStatus);
      }

      setEnterprises(data);

      if (selectedEnterprise) {
        const updatedSelected = data.find(e => e.id === selectedEnterprise.id);
        if (updatedSelected) {
            setSelectedEnterprise(updatedSelected);
            setNoteInput(updatedSelected.ghiChu || "");
        } else {
            setSelectedEnterprise(null);
        }
      }

    } catch (error) {
      console.error("Lỗi khi tải danh sách:", error);
      showNotification("Không thể tải danh sách doanh nghiệp", "error");
    } finally {
      setLoading(false); // Tải xong -> set loading = false
    }
  };

  useEffect(() => {
    fetchEnterprises();
  }, [filterStatus]);

  // --- 2. Xử lý chọn doanh nghiệp ---
  const handleSelectEnterprise = (enterprise) => {
    setSelectedEnterprise(enterprise);
    setNoteInput(enterprise.ghiChu || "");
  };

  // --- 3. API Cập nhật trạng thái (PUT) ---
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedEnterprise) return;

    const statusToSend = newStatus || selectedEnterprise.trangThai;

    const payload = {
      trangThai: statusToSend,
      ghiChu: noteInput
    };

    try {
      await axios.put(
        `${API_BASE_URL}/api/YeuCauDangKyDn/Admin/${selectedEnterprise.id}`, 
        payload
      );
      // Thay alert bằng showNotification
      showNotification("Cập nhật trạng thái thành công!", "success");
      fetchEnterprises();
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      showNotification("Cập nhật thất bại!", "error");
    }
  };

  // --- 4. API Xóa doanh nghiệp (DELETE) ---
  const handleDeleteEnterprise = async () => {
    if (!selectedEnterprise) return;

    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn XÓA doanh nghiệp "${selectedEnterprise.tenDoanhNghiep}" không?`
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/YeuCauDangKyDn/${selectedEnterprise.id}`);
      
      showNotification("Đã xóa doanh nghiệp thành công!", "success");
      setSelectedEnterprise(null); 
      fetchEnterprises(); 

    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      showNotification("Xóa thất bại! Vui lòng thử lại.", "error");
    }
  };

  // --- Helper: Màu sắc trạng thái ---
  const getStatusClass = (status) => {
    if (status === "ACTIVE") return "active"; 
    if (status === "PENDING") return "pending";
    return "";
  };

  const getStatusLabel = (status) => {
      if (status === "ACTIVE") return "Đang hoạt động";
      if (status === "PENDING") return "Chờ duyệt";
      return status;
  }

  const displayedEnterprises = enterprises.filter(ent => 
    ent.tenDoanhNghiep?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ent.maSoThue?.includes(searchTerm)
  );

  return (
    <AdminLayout currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout}>
      
      {/* --- PHẦN THÔNG BÁO POPUP (TOAST) --- */}
      {notification.show && (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '12px 24px',
            borderRadius: '8px',
            backgroundColor: notification.type === 'success' ? '#d4edda' : '#f8d7da',
            color: notification.type === 'success' ? '#155724' : '#721c24',
            border: notification.type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'opacity 0.5s ease-in-out',
            fontWeight: '500'
        }}>
            {notification.type === 'success' ? '✅ ' : '⚠️ '} 
            {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý doanh nghiệp</h1>
          <p className="page-subtitle">Quản lý hồ sơ và phê duyệt doanh nghiệp vào hệ thống.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          className="input-search"
          placeholder="Tìm tên DN, MST..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
            className="select-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
          <option value="PENDING">Chờ xác minh (PENDING)</option>
        </select>
        <button className="btn-primary-sm" onClick={fetchEnterprises}>Làm mới</button>
      </div>

      <div className="grid-2">
        {/* Cột trái: Danh sách */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Danh sách ({displayedEnterprises.length})</div>
          </div>
          <div className="table-container" style={{maxHeight: '600px', overflowY: 'auto'}}>
            
            {/* SỬ DỤNG BIẾN LOADING ĐỂ SỬA LỖI ESLINT */}
            {loading ? (
                <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
                    <div className="spinner"></div> Đang tải dữ liệu...
                </div>
            ) : (
                <table className="table">
                    <thead>
                    <tr>
                        <th>Doanh nghiệp</th>
                        <th>MST</th>
                        <th>Trạng thái</th>
                    </tr>
                    </thead>
                    <tbody>
                    {displayedEnterprises.length > 0 ? (
                        displayedEnterprises.map((item) => (
                            <tr 
                                key={item.id} 
                                className={selectedEnterprise?.id === item.id ? "row-highlight" : ""}
                                onClick={() => handleSelectEnterprise(item)}
                                style={{cursor: 'pointer'}}
                            >
                            <td>
                                <div className="enterprise-name">{item.tenDoanhNghiep}</div>
                                <div className="enterprise-sub" style={{fontSize: '11px', color:'#666'}}>{item.email}</div>
                            </td>
                            <td>{item.maSoThue}</td>
                            <td>
                                <span className={`tag-status ${getStatusClass(item.trangThai)}`}>
                                {getStatusLabel(item.trangThai)}
                                </span>
                            </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" style={{textAlign: "center", padding: "20px"}}>
                                Không tìm thấy dữ liệu.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            )}
          </div>
        </div>

        {/* Cột phải: Chi tiết & Hành động */}
        <div className="panel">
          {selectedEnterprise ? (
            <>
                <div className="panel-header">
                    <div>
                        <div className="panel-title">Chi tiết hồ sơ</div>
                        <div className="panel-subtitle">ID: {selectedEnterprise.id}</div>
                    </div>
                    <span className={`tag-status ${getStatusClass(selectedEnterprise.trangThai)}`}>
                        {selectedEnterprise.trangThai}
                    </span>
                </div>

                <div className="enterprise-detail-grid">
                    <div className="detail-block">
                        <div className="detail-label">Thông tin chung</div>
                        <div className="detail-value">
                            <strong>{selectedEnterprise.tenDoanhNghiep}</strong><br/>
                            MST: {selectedEnterprise.maSoThue}<br/>
                            Email: {selectedEnterprise.email}<br/>
                            SĐT: {selectedEnterprise.soDienThoai}
                        </div>
                    </div>

                    <div className="detail-block">
                        <div className="detail-label">Ghi chú (Admin)</div>
                        <textarea
                            className="note-input"
                            placeholder="Nhập lý do duyệt/từ chối hoặc ghi chú..."
                            rows={3}
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                        />
                    </div>

                    {/* BUTTON ACTIONS */}
                    <div className="enterprise-actions-row" style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                        
                        {/* Nút Duyệt: Chỉ hiện khi đang PENDING */}
                        {selectedEnterprise.trangThai === "PENDING" && (
                             <button 
                                className="btn-primary"
                                onClick={() => handleUpdateStatus("ACTIVE")}
                             >
                                ✅ Duyệt (Active)
                             </button>
                        )}

                        {/* Nút Hủy duyệt/Khóa: Chỉ hiện khi đang ACTIVE */}
                        {selectedEnterprise.trangThai === "ACTIVE" && (
                            <button 
                                className="btn-outline"
                                onClick={() => handleUpdateStatus("PENDING")}
                            >
                                ⏪ Hoàn về chờ duyệt
                            </button>
                        )}
                        
                        {/* Nút Lưu Ghi chú: Luôn hiện */}
                        <button 
                            className="btn-ghost" 
                            onClick={() => handleUpdateStatus(null)}
                        >
                            💾 Lưu ghi chú
                        </button>

                        {/* Nút Xóa: Luôn hiện, màu đỏ */}
                        <button 
                            className="btn-ghost-danger"
                            style={{marginLeft: 'auto', color: '#dc3545', border: '1px solid #dc3545'}}
                            onClick={handleDeleteEnterprise}
                        >
                            🗑️ Xóa doanh nghiệp
                        </button>
                    </div>
                </div>
            </>
          ) : (
            <div style={{padding: "40px", textAlign: "center", color: "#999"}}>
                Chọn một doanh nghiệp để xem chi tiết và xử lý.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default EnterpriseManagementPage;