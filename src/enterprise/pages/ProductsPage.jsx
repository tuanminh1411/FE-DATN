import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Cấu hình base URL
const API_BASE_URL = "http://localhost:5081";
const CURRENT_ENTERPRISE_ID = localStorage.getItem("currentEnterpriseId");

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // State lưu file ảnh người dùng chọn (khi upload mới)
  const [selectedFile, setSelectedFile] = useState(null);
  // State lưu URL xem trước (preview)
  const [previewUrl, setPreviewUrl] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    ten: "",
    maSanPham: "",
    moTa: "",
    tieuChuanApDung: "",
    hinhAnh: "" // Lưu ý: API trả về hinhAnhUrl, nhưng form gửi đi có thể không cần field này nếu không đổi ảnh
  });

  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  }, []);

  // 1. Lấy danh sách sản phẩm
  const fetchProducts = useCallback(async () => {
    if (!CURRENT_ENTERPRISE_ID) {
      showNotification("Vui lòng đăng nhập doanh nghiệp.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/SanPhams/doanh-nghiep/${CURRENT_ENTERPRISE_ID}`);
      // Dữ liệu API trả về có dạng JSON như bạn gửi
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setProducts(data);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Chọn file từ máy tính (khi thêm mới hoặc sửa ảnh)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Preview ảnh vừa chọn từ máy
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ id: "", ten: "", maSanPham: "", moTa: "", tieuChuanApDung: "", hinhAnh: "" });
    setSelectedFile(null);
    setPreviewUrl("");
    setShowModal(true);
  };

  const handleOpenEdit = (product) => {
    setIsEditing(true);
    setFormData({ ...product });
    setSelectedFile(null);
    
    // --- SỬA Ở ĐÂY: Lấy hinhAnhUrl từ dữ liệu API để hiện ảnh cũ ---
    // Kiểm tra xem trường hinhAnhUrl có dữ liệu không
    setPreviewUrl(product.hinhAnhUrl || ""); 
    
    setShowModal(true);
  };

  // 2. Lưu sản phẩm
  const handleSave = async (e) => {
    e.preventDefault();

    if (!CURRENT_ENTERPRISE_ID) {
        showNotification("Lỗi: Không tìm thấy ID doanh nghiệp.", "error");
        return;
    }

    try {
      const dataToSend = new FormData();
      
      dataToSend.append("DoanhNghiepId", CURRENT_ENTERPRISE_ID);
      dataToSend.append("Ten", formData.ten);
      dataToSend.append("MaSanPham", formData.maSanPham);
      dataToSend.append("MoTa", formData.moTa || "");
      dataToSend.append("TieuChuanApDung", formData.tieuChuanApDung || "");
      
      // Nếu có chọn file mới thì gửi file
      if (selectedFile) {
        dataToSend.append("HinhAnh", selectedFile); 
      } 

      const config = {
        headers: { "Content-Type": "multipart/form-data" }
      };

      if (isEditing) {
        dataToSend.append("Id", formData.id);
        await axios.put(`${API_BASE_URL}/api/SanPhams/${formData.id}`, dataToSend, config);
        showNotification("Cập nhật thành công!");
      } else {
        await axios.post(`${API_BASE_URL}/api/SanPhams/ThemSanPham`, dataToSend, config);
        showNotification("Thêm mới thành công!");
      }

      setShowModal(false);
      fetchProducts(); // Load lại để thấy ảnh mới
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      const errorMsg = error.response?.data?.title || "Có lỗi xảy ra!";
      showNotification(`Lỗi: ${errorMsg}`, "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/SanPhams/${id}`);
        showNotification("Đã xóa sản phẩm!");
        fetchProducts();
      } catch { 
        showNotification("Xóa thất bại!", "error"); 
      }
    }
  };

  // --- Styles ---
  const styles = {
    panel: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '24px', overflow: 'hidden' },
    input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce0e4', fontSize: '14px', outline: 'none', transition: 'border 0.2s' },
    label: { fontWeight: '600', marginBottom: '6px', display: 'block', color: '#374151', fontSize: '14px' },
    btnPrimary: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' },
    btnOutline: { padding: '10px 20px', backgroundColor: 'white', color: '#374151', border: '1px solid #dce0e4', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' },
    // Style cho ảnh thumbnail trong bảng
    imgPreview: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    fileInputWrapper: { border: '1px dashed #dce0e4', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px' },
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Toast Notification */}
      {notification.show && (
        <div style={{
            position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
            padding: '14px 20px', borderRadius: '10px', fontWeight: '500',
            backgroundColor: '#fff', 
            color: notification.type === 'success' ? '#059669' : '#dc2626',
            borderLeft: notification.type === 'success' ? '4px solid #10b981' : '4px solid #ef4444',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: '10px'
        }}>
            <span style={{fontSize: '20px'}}>{notification.type === 'success' ? '✅' : '⚠️'}</span>
            {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <div>
          <h1 style={{fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0}}>Quản lý Sản phẩm</h1>
          <p style={{color: '#6b7280', marginTop: '4px'}}>Danh sách sản phẩm và thông tin chi tiết</p>
        </div>
        <button style={styles.btnPrimary} onClick={handleOpenAdd}>+ Thêm sản phẩm mới</button>
      </div>

      {/* Table Panel */}
      <div style={styles.panel}>
        <div className="table-container">
            {loading ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '15px'}}>
                    ⏳ Đang tải dữ liệu...
                </div>
            ) : (
                <table className="table" style={{width: '100%', borderCollapse: 'separate', borderSpacing: '0'}}>
                <thead style={{backgroundColor: '#f9fafb'}}>
                    <tr>
                        <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#4b5563', borderBottom: '1px solid #e5e7eb'}}>Ảnh</th>
                        <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#4b5563', borderBottom: '1px solid #e5e7eb'}}>Tên / Mã</th>
                        <th style={{padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#4b5563', borderBottom: '1px solid #e5e7eb'}}>Tiêu chuẩn</th>
                        <th style={{padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#4b5563', borderBottom: '1px solid #e5e7eb'}}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length > 0 ? products.map((item, index) => (
                    <tr key={item.id} style={{backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'}}>
                        <td style={{padding: '12px 16px', borderBottom: '1px solid #e5e7eb'}}>
                            {/* --- SỬA Ở ĐÂY: Dùng item.hinhAnhUrl --- */}
                            <img 
                                src={item.hinhAnhUrl || "https://via.placeholder.com/60?text=No+Img"} 
                                alt={item.ten} 
                                style={styles.imgPreview} 
                                onError={(e) => {e.target.onerror = null; e.target.src="https://via.placeholder.com/60?text=Error"}}
                            />
                        </td>
                        <td style={{padding: '12px 16px', borderBottom: '1px solid #e5e7eb'}}>
                            <div style={{fontWeight: '600', color: '#111827'}}>{item.ten}</div>
                            <div style={{fontSize: '13px', color: '#6b7280', marginTop: '2px'}}>{item.maSanPham}</div>
                        </td>
                        <td style={{padding: '12px 16px', borderBottom: '1px solid #e5e7eb', color: '#4b5563'}}>{item.tieuChuanApDung}</td>
                        <td style={{padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e5e7eb'}}>
                            <button onClick={() => handleOpenEdit(item)} style={{marginRight: '12px', color: '#2563eb', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer'}}>Sửa</button>
                            <button onClick={() => handleDelete(item.id)} style={{color: '#dc2626', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer'}}>Xóa</button>
                        </td>
                    </tr>
                    )) : (
                        <tr><td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#6b7280'}}>Không có sản phẩm nào.</td></tr>
                    )}
                </tbody>
                </table>
            )}
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '32px', borderRadius: '20px', width: '700px', maxWidth: '95%',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out'
            }}>
                <h2 style={{marginTop: 0, marginBottom: '24px', fontSize: '22px', fontWeight: '700', color: '#111827'}}>
                    {isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h2>
                
                <form onSubmit={handleSave}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px'}}>
                        <div>
                            <label style={styles.label}>Mã sản phẩm <span style={{color: '#ef4444'}}>*</span></label>
                            <input style={styles.input} name="maSanPham" value={formData.maSanPham} onChange={handleInputChange} placeholder="VD: SP01" required />
                        </div>
                        <div>
                            <label style={styles.label}>Tên sản phẩm <span style={{color: '#ef4444'}}>*</span></label>
                            <input style={styles.input} name="ten" value={formData.ten} onChange={handleInputChange} placeholder="VD: Rau cải thảo" required />
                        </div>
                    </div>

                    <div style={{marginBottom: '20px'}}>
                        <label style={styles.label}>Tiêu chuẩn áp dụng</label>
                        <input style={styles.input} name="tieuChuanApDung" value={formData.tieuChuanApDung} onChange={handleInputChange} placeholder="VD: VietGAP" />
                    </div>

                    <div style={{marginBottom: '20px'}}>
                        <label style={styles.label}>Hình ảnh sản phẩm</label>
                        <div style={styles.fileInputWrapper}>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange} 
                                style={{fontSize: '14px', color: '#4b5563'}}
                            />
                            {/* Hiển thị xem trước ảnh (lấy từ previewUrl) */}
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd'}} />
                            ) : (
                                <div style={{width: '80px', height: '80px', backgroundColor: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '12px'}}>
                                    Chưa có ảnh
                                </div>
                            )}
                        </div>
                        <p style={{fontSize: '12px', color: '#6b7280', marginTop: '6px'}}>Chọn file ảnh từ máy tính.</p>
                    </div>

                    <div style={{marginBottom: '24px'}}>
                        <label style={styles.label}>Mô tả chi tiết</label>
                        <textarea style={{...styles.input, height: '100px', resize: 'vertical'}} name="moTa" value={formData.moTa} onChange={handleInputChange} placeholder="Mô tả về sản phẩm..." />
                    </div>

                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '20px'}}>
                        <button type="button" style={styles.btnOutline} onClick={() => setShowModal(false)}>Hủy bỏ</button>
                        <button type="submit" style={styles.btnPrimary}>
                            {isEditing ? "Lưu thay đổi" : "Thêm mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}

export default ProductsPage;