import React, { useState, useEffect } from "react";
import AdminLayout from "../layout/AdminLayout";
import axios from "axios";

// Cấu hình base URL
const API_BASE_URL = "http://localhost:5081";

function EnterpriseManagementPage({ currentPage, onNavigate, onLogout }) {
  // --- STATE ---
  const [enterprises, setEnterprises] = useState([]);
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Notification
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");

  // Selected Item
  const [selectedEnterprise, setSelectedEnterprise] = useState(null);

  // --- STATE MODAL THÊM MỚI ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    nguoiDungId: "",
    tenDoanhNghiep: "",
    maSoThue: "",
    diaChi: "",
    dienThoai: "",
    email: ""
  });

  // --- STATE MODAL CHỈNH SỬA ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: "",
    tenDoanhNghiep: "",
    maSoThue: "",
    diaChi: "",
    dienThoai: "",
    email: "",
    trangThai: ""
  });

  // --- HELPER FUNCTIONS ---
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  // --- 1. API: LẤY DỮ LIỆU ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [entRes, userRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/AdminDoanhNghiep`).catch(() => ({ data: [] })), 
        axios.get(`${API_BASE_URL}/api/NguoiDung`).catch(() => ({ data: [] }))
      ]);

      let rawData = Array.isArray(entRes.data) ? entRes.data : [];
      
      // --- QUAN TRỌNG: MAPPING DỮ LIỆU ---
      // API GET trả về "ten", nhưng UI và POST dùng "tenDoanhNghiep".
      // Ta map ngay tại đây để thống nhất.
      const mappedData = rawData.map(item => ({
        ...item,
        tenDoanhNghiep: item.ten || item.tenDoanhNghiep || "Không có tên", // Ưu tiên 'ten' từ API
      }));

      setEnterprises(mappedData);
      setUsers(Array.isArray(userRes.data) ? userRes.data : []);

      // Cập nhật lại selected item nếu đang chọn (để data realtime)
      if (selectedEnterprise) {
        const updatedItem = mappedData.find(e => e.id === selectedEnterprise.id);
        if (updatedItem) setSelectedEnterprise(updatedItem);
      }

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      showNotification("Không thể tải danh sách doanh nghiệp", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. API: THÊM DOANH NGHIỆP ---
  const handleAddEnterprise = async (e) => {
    e.preventDefault();
    if (!addFormData.nguoiDungId) {
        showNotification("Vui lòng chọn tài khoản chủ sở hữu!", "error");
        return;
    }
    setSubmitting(true);
    try {
      // POST yêu cầu: tenDoanhNghiep
      await axios.post(`${API_BASE_URL}/api/AdminDoanhNghiep/ThemDoanhNghiep`, addFormData);
      showNotification("Thêm doanh nghiệp thành công!", "success");
      setShowAddModal(false);
      setAddFormData({ nguoiDungId: "", tenDoanhNghiep: "", maSoThue: "", diaChi: "", dienThoai: "", email: "" });
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi khi thêm mới.";
      showNotification(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // --- 3. API: SỬA DOANH NGHIỆP ---
  const handleOpenEdit = () => {
    if (!selectedEnterprise) return;
    setEditFormData({
        id: selectedEnterprise.id,
        tenDoanhNghiep: selectedEnterprise.tenDoanhNghiep, // Lấy từ field đã map
        maSoThue: selectedEnterprise.maSoThue || "",
        diaChi: selectedEnterprise.diaChi || "",
        dienThoai: selectedEnterprise.dienThoai || "",
        email: selectedEnterprise.email || "",
        trangThai: selectedEnterprise.trangThai || "ACTIVE"
    });
    setShowEditModal(true);
  };

  const handleUpdateEnterprise = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        // PUT yêu cầu: "ten"
        const payload = {
            ten: editFormData.tenDoanhNghiep, // Mapping ngược lại khi gửi lên
            maSoThue: editFormData.maSoThue,
            email: editFormData.email,
            dienThoai: editFormData.dienThoai,
            diaChi: editFormData.diaChi,
            trangThai: editFormData.trangThai
        };

        await axios.put(`${API_BASE_URL}/api/AdminDoanhNghiep/${editFormData.id}`, payload);
        
        showNotification("Cập nhật thông tin thành công!", "success");
        setShowEditModal(false);
        fetchData();
    } catch (error) {
        console.error(error);
        const msg = error.response?.data?.message || "Lỗi khi cập nhật.";
        showNotification(msg, "error");
    } finally {
        setSubmitting(false);
    }
  };

  // --- HANDLERS UI ---
  const handleSelectEnterprise = (ent) => setSelectedEnterprise(ent);

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddFormData({ ...addFormData, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const displayedEnterprises = enterprises.filter(ent => 
    ent.tenDoanhNghiep?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ent.maSoThue?.includes(searchTerm)
  );

  // --- STYLES ---
  const modalStyles = {
    overlay: {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
    },
    card: {
        backgroundColor: 'white', borderRadius: '16px', width: '600px', maxWidth: '95%',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out'
    },
    header: {
        backgroundColor: '#f8fafc', padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    body: { padding: '24px' },
    sectionTitle: { fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    inputGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' },
    input: {
        width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1',
        fontSize: '14px', outline: 'none', boxSizing: 'border-box'
    },
    select: {
        width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1',
        fontSize: '14px', backgroundColor: '#fff', cursor: 'pointer', outline: 'none'
    },
    footer: {
        padding: '20px 24px', backgroundColor: '#fff', borderTop: '1px solid #e2e8f0',
        display: 'flex', justifyContent: 'flex-end', gap: '12px'
    },
    btnClose: { background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer' },
    btnCancel: {
        padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white',
        color: '#475569', fontWeight: '600', cursor: 'pointer'
    },
    btnSubmit: {
        padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb',
        color: 'white', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout}>
      
      {/* Toast */}
      {notification.show && (
        <div style={{
            position: 'fixed', top: '24px', right: '24px', zIndex: 9999, padding: '14px 20px', 
            borderRadius: '10px', background: '#fff', borderLeft: notification.type === 'success' ? '4px solid #10b981' : '4px solid #ef4444',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
        }}>
            {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Doanh nghiệp</h1>
          <p className="page-subtitle">Quản lý hồ sơ và liên kết tài khoản.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ Thêm Doanh nghiệp</button>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <input 
            className="input-search" placeholder="Tìm tên DN, MST..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <button className="btn-primary-sm" onClick={fetchData}>Làm mới</button>
      </div>

      <div className="grid-2">
        {/* List Panel */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Danh sách doanh nghiệp</div>
          </div>
          <div className="table-container" style={{maxHeight: '600px', overflowY: 'auto'}}>
            {loading ? <div style={{padding:'20px', textAlign:'center'}}>Đang tải...</div> : (
              <table className="table">
                <thead><tr><th>Tên Doanh nghiệp</th><th>MST</th><th>Trạng thái</th></tr></thead>
                <tbody>
                  {displayedEnterprises.map(item => (
                    <tr key={item.id} onClick={() => handleSelectEnterprise(item)} 
                        className={selectedEnterprise?.id === item.id ? "row-highlight" : ""} style={{cursor:'pointer'}}>
                      <td>
                          <div style={{fontWeight:'600', color:'#1e293b'}}>{item.tenDoanhNghiep}</div>
                          <div style={{fontSize:'12px', color:'#64748b'}}>{item.email}</div>
                      </td>
                      <td>{item.maSoThue}</td>
                      <td>
                          <span className={`tag-status ${item.trangThai === 'ACTIVE' || item.trangThai === true ? 'active' : 'pending'}`}>
                              {item.trangThai === 'ACTIVE' || item.trangThai === true ? 'Hoạt động' : 'Chờ duyệt'}
                          </span>
                      </td>
                    </tr>
                  ))}
                  {displayedEnterprises.length === 0 && <tr><td colSpan="3" style={{textAlign:'center', padding:'20px'}}>Chưa có dữ liệu</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="panel">
          {selectedEnterprise ? (
            <div>
               <div className="panel-header">
                  <div className="panel-title">Chi tiết</div>
                  <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                      <div className="panel-subtitle">ID: {selectedEnterprise.id.substring(0,8)}...</div>
                      <button onClick={handleOpenEdit} style={{cursor:'pointer', border:'none', background:'none', fontSize:'18px'}} title="Chỉnh sửa">
                        ✏️
                      </button>
                  </div>
               </div>
               <div style={{padding:'20px'}}>
                  <div style={{marginBottom:'15px'}}>
                      <label style={modalStyles.sectionTitle}>Thông tin chính</label>
                      <div style={{fontSize:'18px', fontWeight:'bold', marginBottom:'5px', color:'#2563eb'}}>
                          {selectedEnterprise.tenDoanhNghiep}
                      </div>
                      <div style={{color:'#64748b'}}>MST: <strong>{selectedEnterprise.maSoThue}</strong></div>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginBottom:'20px'}}>
                      <div>
                          <label style={{fontSize:'12px', color:'#94a3b8'}}>Email</label>
                          <div style={{fontWeight:500}}>{selectedEnterprise.email || '---'}</div>
                      </div>
                      <div>
                          <label style={{fontSize:'12px', color:'#94a3b8'}}>Điện thoại</label>
                          <div style={{fontWeight:500}}>{selectedEnterprise.dienThoai || '---'}</div>
                      </div>
                      <div style={{gridColumn:'span 2'}}>
                          <label style={{fontSize:'12px', color:'#94a3b8'}}>Địa chỉ</label>
                          <div>{selectedEnterprise.diaChi || '---'}</div>
                      </div>
                      <div>
                          <label style={{fontSize:'12px', color:'#94a3b8'}}>Trạng thái</label>
                          <div style={{fontWeight:500, color: selectedEnterprise.trangThai === 'ACTIVE' ? 'green' : 'orange'}}>
                              {selectedEnterprise.trangThai}
                          </div>
                      </div>
                  </div>
                  <div style={{padding:'15px', background:'#f1f5f9', borderRadius:'8px'}}>
                      <div><strong>Admin ID:</strong></div>
                      {/* Vì API AdminDoanhNghiep/list không trả về tên User, chỉ trả về ID nếu có, hoặc không trả về gì. 
                          Nếu bạn muốn hiển thị tên Admin, bạn cần find trong danh sách `users` bằng nguoiDungId (nếu có trường này trong response GET) */}
                      <div>{selectedEnterprise.nguoiDungId || '---'}</div> 
                  </div>
                  <div style={{marginTop:'20px', textAlign:'right'}}>
                      <button onClick={handleOpenEdit} style={modalStyles.btnSubmit}>Sửa thông tin</button>
                  </div>
               </div>
            </div>
          ) : (
            <div style={{padding:'40px', textAlign:'center', color:'#94a3b8'}}>
                <div style={{fontSize:'40px', marginBottom:'10px'}}>🏢</div>
                Chọn doanh nghiệp để xem chi tiết
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL THÊM DOANH NGHIỆP --- */}
      {showAddModal && (
        <div style={modalStyles.overlay} onClick={() => setShowAddModal(false)}>
          <div style={modalStyles.card} onClick={e => e.stopPropagation()}>
            <div style={modalStyles.header}>
                <h2 style={{margin:0, fontSize:'20px', color:'#1e293b'}}>Thêm Doanh Nghiệp</h2>
                <button style={modalStyles.btnClose} onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddEnterprise}>
                <div style={modalStyles.body}>
                    <div style={{marginBottom:'24px', padding:'16px', backgroundColor:'#f0f9ff', borderRadius:'8px', border:'1px dashed #bae6fd'}}>
                        <label style={{...modalStyles.label, color:'#0369a1', marginBottom:'8px'}}>👤 Chọn Chủ sở hữu *</label>
                        <select 
                            style={{...modalStyles.select, borderColor:'#bae6fd'}}
                            name="nguoiDungId" value={addFormData.nguoiDungId} onChange={handleAddInputChange} required
                        >
                            <option value="">-- Tìm người dùng --</option>
                            {users.map(u => (<option key={u.id} value={u.id}>{u.hoTen} ({u.email})</option>))}
                        </select>
                    </div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                        <div style={modalStyles.inputGroup}>
                            <label style={modalStyles.label}>Tên doanh nghiệp *</label>
                            <input style={modalStyles.input} name="tenDoanhNghiep" value={addFormData.tenDoanhNghiep} onChange={handleAddInputChange} required />
                        </div>
                        <div style={modalStyles.inputGroup}>
                            <label style={modalStyles.label}>Mã số thuế *</label>
                            <input style={modalStyles.input} name="maSoThue" value={addFormData.maSoThue} onChange={handleAddInputChange} required />
                        </div>
                    </div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                        <div style={modalStyles.inputGroup}><label style={modalStyles.label}>Email</label><input style={modalStyles.input} name="email" value={addFormData.email} onChange={handleAddInputChange}/></div>
                        <div style={modalStyles.inputGroup}><label style={modalStyles.label}>SĐT</label><input style={modalStyles.input} name="dienThoai" value={addFormData.dienThoai} onChange={handleAddInputChange}/></div>
                    </div>
                    <div style={modalStyles.inputGroup}><label style={modalStyles.label}>Địa chỉ</label><input style={modalStyles.input} name="diaChi" value={addFormData.diaChi} onChange={handleAddInputChange}/></div>
                </div>
                <div style={modalStyles.footer}>
                    <button type="button" style={modalStyles.btnCancel} onClick={() => setShowAddModal(false)}>Hủy</button>
                    <button type="submit" style={modalStyles.btnSubmit} disabled={submitting}>{submitting ? "..." : "Thêm mới"}</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL SỬA DOANH NGHIỆP --- */}
      {showEditModal && (
        <div style={modalStyles.overlay} onClick={() => setShowEditModal(false)}>
          <div style={modalStyles.card} onClick={e => e.stopPropagation()}>
            <div style={modalStyles.header}>
                <h2 style={{margin:0, fontSize:'20px', color:'#1e293b'}}>Cập nhật thông tin</h2>
                <button style={modalStyles.btnClose} onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateEnterprise}>
                <div style={modalStyles.body}>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                        <div style={modalStyles.inputGroup}>
                            <label style={modalStyles.label}>Tên doanh nghiệp *</label>
                            <input style={modalStyles.input} name="tenDoanhNghiep" value={editFormData.tenDoanhNghiep} onChange={handleEditInputChange} required />
                        </div>
                        <div style={modalStyles.inputGroup}>
                            <label style={modalStyles.label}>Mã số thuế *</label>
                            <input style={modalStyles.input} name="maSoThue" value={editFormData.maSoThue} onChange={handleEditInputChange} required />
                        </div>
                    </div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                        <div style={modalStyles.inputGroup}><label style={modalStyles.label}>Email</label><input style={modalStyles.input} name="email" value={editFormData.email} onChange={handleEditInputChange}/></div>
                        <div style={modalStyles.inputGroup}><label style={modalStyles.label}>SĐT</label><input style={modalStyles.input} name="dienThoai" value={editFormData.dienThoai} onChange={handleEditInputChange}/></div>
                    </div>
                    <div style={modalStyles.inputGroup}><label style={modalStyles.label}>Địa chỉ</label><input style={modalStyles.input} name="diaChi" value={editFormData.diaChi} onChange={handleEditInputChange}/></div>
                    
                    {/* Select trạng thái */}
                    <div style={modalStyles.inputGroup}>
                        <label style={modalStyles.label}>Trạng thái</label>
                        <select style={modalStyles.select} name="trangThai" value={editFormData.trangThai} onChange={handleEditInputChange}>
                            <option value="ACTIVE">ACTIVE (Đang hoạt động)</option>
                            <option value="PENDING">PENDING (Tạm khóa/Chờ duyệt)</option>
                        </select>
                    </div>
                </div>
                <div style={modalStyles.footer}>
                    <button type="button" style={modalStyles.btnCancel} onClick={() => setShowEditModal(false)}>Hủy</button>
                    <button type="submit" style={modalStyles.btnSubmit} disabled={submitting}>{submitting ? "..." : "Lưu thay đổi"}</button>
                </div>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

export default EnterpriseManagementPage;