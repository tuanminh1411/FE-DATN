import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Cấu hình base URL
const API_BASE_URL = "http://localhost:5081";
const CURRENT_ENTERPRISE_ID = localStorage.getItem("currentEnterpriseId");

// Key để lưu bản nháp
const DRAFT_KEY = "PRODUCT_CREATE_DRAFT";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Form State
  const initialFormState = {
    id: "",
    doanhNghiepId: CURRENT_ENTERPRISE_ID,
    loaiSanPhamId: "", 
    ten: "",
    maSanPham: "",
    moTa: "",
    tieuChuanApDung: "",
    gia: "",
    soLuong: "",
    donViTinh: "",
    ngaySanXuat: "",
    hanSuDung: "",
    noiSanXuat: "",
    hinhAnhUrl: "" // Trường này sẽ được lưu vào Local Storage
  };

  const [formData, setFormData] = useState(initialFormState);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  }, []);

  // --- 1. TỰ ĐỘNG LƯU NHÁP VÀO LOCAL STORAGE ---
  // Mỗi khi bạn nhập liệu, nó sẽ lưu ngay vào localStorage
  useEffect(() => {
    if (showModal && !isEditing) {
      const timeoutId = setTimeout(() => {
        // Lưu toàn bộ formData (bao gồm cả link ảnh text)
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      }, 500); 
      return () => clearTimeout(timeoutId);
    }
  }, [formData, showModal, isEditing]);

  // --- 2. API CALLS ---
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/LoaiSanPhams`); 
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setCategories(data);
    } catch (error) {
      console.error("Lỗi tải loại sản phẩm:", error);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!CURRENT_ENTERPRISE_ID) {
      showNotification("Vui lòng đăng nhập doanh nghiệp.", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/SanPhams/doanh-nghiep/${CURRENT_ENTERPRISE_ID}`);
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setProducts(data);
    } catch (error) {
      console.error("Lỗi tải danh sách sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => { 
    fetchCategories();
    fetchProducts(); 
  }, [fetchCategories, fetchProducts]);

  // --- 3. HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // --- KHÔI PHỤC DỮ LIỆU TỪ LOCAL STORAGE KHI MỞ FORM ---
  const handleOpenAdd = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl("");

    // Lấy dữ liệu nháp
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        // Đổ dữ liệu nháp vào Form
        setFormData({ ...initialFormState, ...parsedDraft });
        
        // Nếu trong nháp có link ảnh, hiển thị preview luôn
        if (parsedDraft.hinhAnhUrl) {
            setPreviewUrl(parsedDraft.hinhAnhUrl);
        }
      } catch  {
        setFormData(initialFormState);
      }
    } else {
      setFormData(initialFormState);
    }
    setShowModal(true);
  };

  const handleOpenEdit = (product) => {
    setIsEditing(true);
    setFormData({ 
        ...product,
        loaiSanPhamId: product.loaiSanPhamId || "", 
        ngaySanXuat: product.ngaySanXuat ? product.ngaySanXuat.split('T')[0] : "",
        hanSuDung: product.hanSuDung ? product.hanSuDung.split('T')[0] : "",
        gia: product.gia || 0,
        soLuong: product.soLuong || 0,
        hinhAnhUrl: product.hinhAnhUrl || ""
    });
    setSelectedFile(null);
    setPreviewUrl(product.hinhAnhUrl || ""); 
    setShowModal(true);
  };

  const handleCancel = () => {
    if (!isEditing) {
        // Xóa nháp khi người dùng chủ động Hủy
        localStorage.removeItem(DRAFT_KEY);
        setFormData(initialFormState);
    }
    setShowModal(false);
  };

  // --- 4. GỬI DỮ LIỆU XUỐNG BACKEND ---
  const handleSave = async (e) => {
    e.preventDefault();

    if (!CURRENT_ENTERPRISE_ID) {
        showNotification("Lỗi: Không tìm thấy ID doanh nghiệp.", "error");
        return;
    }

    // Validation
    if (!formData.ten.trim()) {
      showNotification("Tên sản phẩm không được để trống.", "error");
      return;
    }
    if (!formData.maSanPham.trim()) {
      showNotification("Mã sản phẩm không được để trống.", "error");
      return;
    }
    if (!formData.loaiSanPhamId) {
      showNotification("Vui lòng chọn loại sản phẩm.", "error");
      return;
    }
    if (formData.gia && (isNaN(Number(formData.gia)) || Number(formData.gia) < 0)) {
      showNotification("Giá bán phải là số không âm.", "error");
      return;
    }
    if (formData.soLuong && (isNaN(Number(formData.soLuong)) || Number(formData.soLuong) < 0)) {
      showNotification("Số lượng phải là số không âm.", "error");
      return;
    }
    if (formData.ngaySanXuat && formData.hanSuDung && new Date(formData.hanSuDung) <= new Date(formData.ngaySanXuat)) {
      showNotification("Hạn sử dụng phải sau ngày sản xuất.", "error");
      return;
    }

    try {
      const dataToSend = new FormData();
      
      // Các trường cơ bản
      dataToSend.append("DoanhNghiepId", CURRENT_ENTERPRISE_ID);
      dataToSend.append("Ten", formData.ten);
      dataToSend.append("MaSanPham", formData.maSanPham);
      dataToSend.append("MoTa", formData.moTa || "");
      dataToSend.append("TieuChuanApDung", formData.tieuChuanApDung || "");
      dataToSend.append("DonViTinh", formData.donViTinh || "");
      dataToSend.append("NoiSanXuat", formData.noiSanXuat || "");

      // Xử lý dữ liệu an toàn để tránh lỗi 500
      if (formData.loaiSanPhamId) dataToSend.append("LoaiSanPhamId", formData.loaiSanPhamId);
      dataToSend.append("Gia", formData.gia ? Number(formData.gia) : 0);
      dataToSend.append("SoLuong", formData.soLuong ? Number(formData.soLuong) : 0);
      if (formData.ngaySanXuat) dataToSend.append("NgaySanXuat", formData.ngaySanXuat);
      if (formData.hanSuDung) dataToSend.append("HanSuDung", formData.hanSuDung);

      // Ưu tiên 1: Gửi file ảnh (Binary)
      if (selectedFile) {
        dataToSend.append("HinhAnh", selectedFile); 
      } 
      // Ưu tiên 2: Gửi link ảnh (String) - Lấy từ State (vốn đã lấy từ LocalStorage)
      else if (formData.hinhAnhUrl) {
        dataToSend.append("HinhAnhUrl", formData.hinhAnhUrl);
      }

      const config = {};

      if (isEditing) {
        dataToSend.append("Id", formData.id);
        await axios.put(`${API_BASE_URL}/api/SanPhams/${formData.id}`, dataToSend, config);
        showNotification("Cập nhật thành công!");
      } else {
        await axios.post(`${API_BASE_URL}/api/SanPhams/ThemSanPham`, dataToSend, config);
        showNotification("Thêm mới thành công!");
        
        // Xóa bản nháp trong LocalStorage sau khi đã lưu thành công vào Database
        localStorage.removeItem(DRAFT_KEY);
      }

      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Lỗi khi lưu (Chi tiết):", error.response);
      const errorData = error.response?.data;
      const msg = errorData?.title || errorData?.message || errorData || "Có lỗi xảy ra (500)! Kiểm tra lại dữ liệu nhập.";
      showNotification(`Lỗi: ${msg}`, "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/SanPhams/${id}`);
        showNotification("Đã xóa sản phẩm!");
        fetchProducts();
      } catch  { 
        showNotification("Xóa thất bại!", "error"); 
      }
    }
  };

  const getCategoryName = (id) => {
      if (!id) return "Chưa phân loại";
      const cat = categories.find(c => c.id === id);
      return cat ? (cat.tenLoai || cat.TenLoai) : "Khác";
  };

  const styles = {
    panel: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '24px', overflow: 'hidden' },
    input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce0e4', fontSize: '14px', outline: 'none' },
    label: { fontWeight: '600', marginBottom: '6px', display: 'block', color: '#374151', fontSize: '14px' },
    btnPrimary: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    btnOutline: { padding: '10px 20px', backgroundColor: 'white', color: '#374151', border: '1px solid #dce0e4', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    imgPreview: { width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' },
    fileInputWrapper: { border: '1px dashed #dce0e4', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection:'column', gap: '10px' },
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {notification.show && (
        <div style={{
            position: 'fixed', top: '24px', right: '24px', zIndex: 9999, padding: '14px 20px', borderRadius: '10px', backgroundColor: '#fff', 
            borderLeft: notification.type === 'success' ? '4px solid #10b981' : '4px solid #ef4444',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
        }}>
            {notification.message}
        </div>
      )}

      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <div>
          <h1 style={{fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0}}>Quản lý Sản phẩm</h1>
          <p style={{color: '#6b7280', marginTop: '4px'}}>Danh sách sản phẩm và thông tin chi tiết</p>
        </div>
        <button style={styles.btnPrimary} onClick={handleOpenAdd}>+ Thêm sản phẩm mới</button>
      </div>

      <div style={styles.panel}>
        {loading ? <div style={{padding: '40px', textAlign: 'center'}}>⏳ Đang tải dữ liệu...</div> : (
            <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: '0'}}>
            <thead style={{backgroundColor: '#f9fafb'}}>
                <tr>
                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd'}}>Ảnh</th>
                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd'}}>Mã / Tên</th>
                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd'}}>Loại SP</th>
                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd'}}>Giá / Tồn kho</th>
                    <th style={{padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd'}}>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {products.length > 0 ? products.map((item) => (
                <tr key={item.id} style={{backgroundColor: 'white'}}>
                    <td style={{padding: '12px', borderBottom: '1px solid #eee'}}>
                        <img src={item.hinhAnhUrl || "https://via.placeholder.com/50"} alt="" style={styles.imgPreview} onError={(e) => {e.target.src="https://via.placeholder.com/50"}}/>
                    </td>
                    <td style={{padding: '12px', borderBottom: '1px solid #eee'}}>
                        <div style={{fontWeight: '600', color: '#111827'}}>{item.ten}</div>
                        <div style={{fontSize: '13px', color: '#6b7280'}}>{item.maSanPham}</div>
                    </td>
                    <td style={{padding: '12px', borderBottom: '1px solid #eee'}}>
                        <span style={{backgroundColor: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '500'}}>
                            {getCategoryName(item.loaiSanPhamId)}
                        </span>
                    </td>
                    <td style={{padding: '12px', borderBottom: '1px solid #eee'}}>
                        <div style={{color: '#d97706', fontWeight: '600'}}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.gia || 0)}
                        </div>
                        <div style={{fontSize: '12px', color: '#666'}}>SL: {item.soLuong} {item.donViTinh}</div>
                    </td>
                    <td style={{padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee'}}>
                        <button onClick={() => handleOpenEdit(item)} style={{marginRight: '12px', color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer'}}>Sửa</button>
                        <button onClick={() => handleDelete(item.id)} style={{color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer'}}>Xóa</button>
                    </td>
                </tr>
                )) : (
                    <tr><td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#6b7280'}}>Không có sản phẩm nào.</td></tr>
                )}
            </tbody>
            </table>
        )}
      </div>

      {showModal && (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '32px', borderRadius: '20px', width: '850px', maxWidth: '95%',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto'
            }}>
                <h2 style={{marginTop: 0, marginBottom: '24px'}}>{isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
                
                <form onSubmit={handleSave}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px'}}>
                        <div>
                            <label style={styles.label}>Mã sản phẩm *</label>
                            <input style={styles.input} name="maSanPham" value={formData.maSanPham} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <label style={styles.label}>Tên sản phẩm *</label>
                            <input style={styles.input} name="ten" value={formData.ten} onChange={handleInputChange} required />
                        </div>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px'}}>
                        <div>
                            <label style={styles.label}>Loại sản phẩm *</label>
                            <select style={styles.input} name="loaiSanPhamId" value={formData.loaiSanPhamId} onChange={handleInputChange} required>
                                <option value="">-- Chọn loại --</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.tenLoai || cat.TenLoai}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Giá bán (VNĐ)</label>
                            <input type="number" style={styles.input} name="gia" value={formData.gia} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label style={styles.label}>Số lượng</label>
                            <input type="number" style={styles.input} name="soLuong" value={formData.soLuong} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
                        <div>
                            <label style={styles.label}>Đơn vị tính</label>
                            <input style={styles.input} name="donViTinh" value={formData.donViTinh} onChange={handleInputChange} placeholder="VD: Hộp" />
                        </div>
                        <div>
                            <label style={styles.label}>Nơi sản xuất</label>
                            <input style={styles.input} name="noiSanXuat" value={formData.noiSanXuat} onChange={handleInputChange} placeholder="VD: Việt Nam" />
                        </div>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px'}}>
                        <div>
                            <label style={styles.label}>Ngày sản xuất</label>
                            <input type="date" style={styles.input} name="ngaySanXuat" value={formData.ngaySanXuat} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label style={styles.label}>Hạn sử dụng</label>
                            <input type="date" style={styles.input} name="hanSuDung" value={formData.hanSuDung} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label style={styles.label}>Tiêu chuẩn</label>
                            <input style={styles.input} name="tieuChuanApDung" value={formData.tieuChuanApDung} onChange={handleInputChange} placeholder="VD: ISO, VietGAP" />
                        </div>
                    </div>

                    <div style={{marginBottom: '20px'}}>
                        <label style={styles.label}>Hình ảnh sản phẩm</label>
                        <div style={styles.fileInputWrapper}>
                            {/* Chọn file */}
                            <input type="file" accept="image/*" onChange={handleFileChange} />
                            
                            {/* Hoặc nhập link */}
                            <input 
                                style={styles.input} 
                                name="hinhAnhUrl" 
                                value={formData.hinhAnhUrl} 
                                onChange={handleInputChange} 
                                placeholder="Hoặc dán link ảnh vào đây (Lưu được vào nháp)" 
                            />

                            {/* Preview */}
                            {(previewUrl || formData.hinhAnhUrl) && (
                                <img src={previewUrl || formData.hinhAnhUrl} alt="Preview" style={{width:'80px', height:'80px', borderRadius:'8px', objectFit:'cover', border: '1px solid #ddd', marginTop: '10px'}} />
                            )}
                        </div>
                    </div>

                    <div style={{marginBottom: '24px'}}>
                        <label style={styles.label}>Mô tả chi tiết</label>
                        <textarea style={{...styles.input, height: '80px', resize: 'vertical'}} name="moTa" value={formData.moTa} onChange={handleInputChange} />
                    </div>

                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '20px'}}>
                        <button type="button" style={styles.btnOutline} onClick={handleCancel}>Hủy bỏ</button>
                        <button type="submit" style={styles.btnPrimary}>{isEditing ? "Lưu thay đổi" : "Thêm mới"}</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;