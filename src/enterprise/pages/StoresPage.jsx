import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Cấu hình base URL (giả định endpoint là /api/CuaHangs)
const API_BASE_URL = "http://localhost:5081";
const CURRENT_ENTERPRISE_ID = localStorage.getItem("currentEnterpriseId");

function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form data khớp với JSON hình ảnh bạn gửi
  const [formData, setFormData] = useState({
    id: "",
    ten: "",
    diaDiemId: "", // ID địa điểm (UUID)
    lienHe: "",    // Số điện thoại hoặc email liên hệ
    doanhNghiepId: CURRENT_ENTERPRISE_ID
  });

  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  // Hàm hiển thị thông báo
  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  }, []);

  // 1. Lấy danh sách cửa hàng
  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      // Giả định API là /api/CuaHangs
      const response = await axios.get(`${API_BASE_URL}/api/CuaHangs`);
      const allStores = Array.isArray(response.data) ? response.data : response.data?.data || [];
      
      // Lọc theo doanh nghiệp hiện tại
      if (CURRENT_ENTERPRISE_ID) {
        const filtered = allStores.filter(s => s.doanhNghiepId === CURRENT_ENTERPRISE_ID);
        setStores(filtered);
      } else {
        setStores([]);
        showNotification("Vui lòng đăng nhập doanh nghiệp.", "error");
      }
    } catch (error) {
      console.error("Lỗi tải danh sách cửa hàng:", error);
      // showNotification("Không thể tải danh sách cửa hàng", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Xử lý input thay đổi
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Mở modal Thêm mới
  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      id: "",
      ten: "",
      diaDiemId: "",
      lienHe: "",
      doanhNghiepId: CURRENT_ENTERPRISE_ID
    });
    setShowModal(true);
  };

  // Mở modal Sửa
  const handleOpenEdit = (store) => {
    setIsEditing(true);
    setFormData({
        id: store.id,
        ten: store.ten,
        diaDiemId: store.diaDiemId,
        lienHe: store.lienHe,
        doanhNghiepId: store.doanhNghiepId
    });
    setShowModal(true);
  };

  // 2. Lưu dữ liệu (Thêm/Sửa)
  const handleSave = async (e) => {
    e.preventDefault();

    if (!CURRENT_ENTERPRISE_ID) {
        showNotification("Lỗi: Không tìm thấy ID Doanh nghiệp.", "error");
        return;
    }

    // Chuẩn bị payload khớp với JSON yêu cầu
    const payload = {
        doanhNghiepId: CURRENT_ENTERPRISE_ID,
        ten: formData.ten,
        diaDiemId: formData.diaDiemId, // Trong thực tế cái này có thể là dropdown chọn địa điểm
        lienHe: formData.lienHe
    };

    if (isEditing) {
        payload.id = formData.id;
    }

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/api/CuaHangs/${formData.id}`, payload);
        showNotification("Cập nhật cửa hàng thành công!");
      } else {
        await axios.post(`${API_BASE_URL}/api/CuaHangs`, payload);
        showNotification("Thêm cửa hàng mới thành công!");
      }
      setShowModal(false);
      fetchStores();
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      const errorMsg = error.response?.data?.title || "Có lỗi xảy ra!";
      showNotification(`Lỗi: ${errorMsg}`, "error");
    }
  };

  // 3. Xóa cửa hàng
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa cửa hàng này?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/CuaHangs/${id}`);
        showNotification("Đã xóa cửa hàng!");
        fetchStores();
      } catch (error) {
        console.error("Lỗi xóa:", error);
        showNotification("Xóa thất bại!", "error");
      }
    }
  };

  // CSS Styles (Tái sử dụng style của trang Products cho đồng bộ)
  const styles = {
    panel: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '24px', overflow: 'hidden' },
    input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce0e4', fontSize: '14px', outline: 'none', marginBottom: '15px' },
    label: { fontWeight: '600', marginBottom: '6px', display: 'block', color: '#374151', fontSize: '14px' },
    btnPrimary: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    btnOutline: { padding: '10px 20px', backgroundColor: 'white', color: '#374151', border: '1px solid #dce0e4', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    tagInfo: { backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Toast Notification */}
      {notification.show && (
        <div style={{
            position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
            padding: '14px 20px', borderRadius: '10px', fontWeight: '500',
            backgroundColor: '#fff', 
            borderLeft: notification.type === 'success' ? '4px solid #10b981' : '4px solid #ef4444',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
            <span>{notification.type === 'success' ? '✅' : '⚠️'}</span> {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <div>
          <h1 className="page-title" style={{fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0}}>Chuỗi cửa hàng</h1>
          <p className="page-subtitle" style={{color: '#6b7280', marginTop: '4px'}}>Quản lý các điểm bán hàng và phân phối.</p>
        </div>
        <button style={styles.btnPrimary} onClick={handleOpenAdd}>+ Thêm cửa hàng</button>
      </div>

      {/* Table Panel */}
      <div style={styles.panel}>
        {loading ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>⏳ Đang tải dữ liệu...</div>
        ) : (
            <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: '0'}}>
                <thead style={{backgroundColor: '#f9fafb'}}>
                    <tr>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', color: '#4b5563'}}>Tên cửa hàng</th>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', color: '#4b5563'}}>Thông tin liên hệ</th>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', color: '#4b5563'}}>Mã địa điểm</th>
                        <th style={{padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', color: '#4b5563'}}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {stores.length > 0 ? stores.map((item) => (
                        <tr key={item.id} style={{borderBottom: '1px solid #f3f4f6'}}>
                            <td style={{padding: '12px', borderBottom: '1px solid #eee'}}>
                                <b>{item.ten}</b>
                            </td>
                            <td style={{padding: '12px', borderBottom: '1px solid #eee'}}>
                                {item.lienHe}
                            </td>
                            <td style={{padding: '12px', borderBottom: '1px solid #eee'}}>
                                <span style={styles.tagInfo}>{item.diaDiemId}</span>
                            </td>
                            <td style={{padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee'}}>
                                <button onClick={() => handleOpenEdit(item)} style={{marginRight: '10px', color: '#2563eb', border:'none', background:'none', cursor:'pointer', fontWeight:'500'}}>Sửa</button>
                                <button onClick={() => handleDelete(item.id)} style={{color: '#dc2626', border:'none', background:'none', cursor:'pointer', fontWeight:'500'}}>Xóa</button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#888'}}>Chưa có cửa hàng nào.</td></tr>
                    )}
                </tbody>
            </table>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '500px', maxWidth: '90%',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{marginTop: 0, marginBottom: '20px', color: '#111827'}}>
                    {isEditing ? "Cập nhật cửa hàng" : "Thêm cửa hàng mới"}
                </h2>
                
                <form onSubmit={handleSave}>
                    <div>
                        <label style={styles.label}>Tên cửa hàng <span style={{color:'red'}}>*</span></label>
                        <input style={styles.input} name="ten" value={formData.ten} onChange={handleInputChange} placeholder="VD: Chi nhánh Cầu Giấy" required />
                    </div>

                    <div>
                        <label style={styles.label}>Thông tin liên hệ</label>
                        <input style={styles.input} name="lienHe" value={formData.lienHe} onChange={handleInputChange} placeholder="SĐT hoặc Email quản lý" />
                    </div>

                    <div>
                        <label style={styles.label}>Mã địa điểm (ID) <span style={{color:'red'}}>*</span></label>
                        <input style={styles.input} name="diaDiemId" value={formData.diaDiemId} onChange={handleInputChange} placeholder="Nhập ID địa điểm..." required />
                        {/* Lưu ý: Nếu có API địa điểm riêng, chỗ này nên là Dropdown Select */}
                    </div>

                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
                        <button type="button" style={styles.btnOutline} onClick={() => setShowModal(false)}>Hủy bỏ</button>
                        <button type="submit" style={styles.btnPrimary}>
                            {isEditing ? "Lưu thay đổi" : "Tạo cửa hàng"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

export default StoresPage;