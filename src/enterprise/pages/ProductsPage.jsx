import React, { useState, useEffect } from "react";
import axios from "axios";

// Cấu hình base URL
const API_BASE_URL = "http://localhost:5081";
const CURRENT_ENTERPRISE_ID = localStorage.getItem("currentEnterpriseId");

// --- CẤU HÌNH CLOUDINARY ---
const CLOUD_NAME = "drloz0wgb"; 
const UPLOAD_PRESET = "my_preset"; 

function ProductsPage() {
  const [products, setProducts] = useState([]);
  
  // [FIX 1] Sử dụng biến loading trong giao diện bên dưới
  const [loading, setLoading] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    ten: "",
    maSanPham: "",
    moTa: "",
    hinhAnhUrl: "",
    tieuChuanApDung: "",
    trangThai: "ACTIVE"
  });

  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/SanPhams/doanh-nghiep/${CURRENT_ENTERPRISE_ID}`);
      setProducts(response.data || []);
    } catch (error) {
      // [FIX 2] Sử dụng biến error để log ra console
      console.error("Lỗi khi tải danh sách:", error);
      showNotification("Không thể tải danh sách sản phẩm", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET); 
    data.append("cloud_name", CLOUD_NAME);

    try {
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, data);
      const imageUrl = res.data.secure_url;
      setFormData(prev => ({ ...prev, hinhAnhUrl: imageUrl }));
      showNotification("Đã tải ảnh lên thành công!");
    } catch (error) {
      // [FIX 2] Log lỗi upload ảnh
      console.error("Lỗi upload ảnh:", error);
      showNotification("Lỗi khi tải ảnh. Vui lòng thử lại.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ id: "", ten: "", maSanPham: "", moTa: "", hinhAnhUrl: "", tieuChuanApDung: "", trangThai: "ACTIVE" });
    setShowModal(true);
  };

  const handleOpenEdit = (product) => {
    setIsEditing(true);
    setFormData({ ...product });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/api/SanPhams/${formData.id}`, formData);
        showNotification("Cập nhật thành công!");
      } else {
        await axios.post(`${API_BASE_URL}/api/SanPhams`, { ...formData, doanhNghiepId: CURRENT_ENTERPRISE_ID });
        showNotification("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      // [FIX 2] Log lỗi khi lưu
      console.error("Lỗi khi lưu sản phẩm:", error);
      showNotification("Có lỗi xảy ra!", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/SanPhams/${id}`);
        showNotification("Đã xóa sản phẩm!");
        fetchProducts();
      } catch (error) { 
        // [FIX 2] Log lỗi khi xóa
        console.error("Lỗi khi xóa:", error);
        showNotification("Xóa thất bại!", "error"); 
      }
    }
  };

  return (
    <>
      {notification.show && (
        <div style={{
            position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
            padding: '12px 24px', borderRadius: '8px',
            backgroundColor: notification.type === 'success' ? '#d4edda' : '#f8d7da',
            color: notification.type === 'success' ? '#155724' : '#721c24',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
            {notification.type === 'success' ? '✅ ' : '⚠️ '} {notification.message}
        </div>
      )}

      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <div>
          <h1 className="page-title">Quản lý Sản phẩm</h1>
          <p className="page-subtitle">Danh sách sản phẩm và thông tin chi tiết</p>
        </div>
        <button className="btn-primary" onClick={handleOpenAdd}>+ Thêm sản phẩm</button>
      </div>

      <div className="panel">
        <div className="table-container">
            {/* [FIX 1] Sử dụng biến loading để hiển thị trạng thái tải */}
            {loading ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>
                    ⏳ Đang tải dữ liệu...
                </div>
            ) : (
                <table className="table">
                <thead>
                    <tr>
                    <th>Ảnh</th>
                    <th>Tên / Mã</th>
                    <th>Tiêu chuẩn</th>
                    <th>Trạng thái</th>
                    <th className="text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length > 0 ? products.map((item) => (
                    <tr key={item.id}>
                        <td>
                            <img 
                                src={item.hinhAnhUrl || "https://via.placeholder.com/50"} 
                                alt="" 
                                style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd'}} 
                            />
                        </td>
                        <td>
                            <div style={{fontWeight: '600'}}>{item.ten}</div>
                            <div style={{fontSize: '12px', color: '#666'}}>{item.maSanPham}</div>
                        </td>
                        <td>{item.tieuChuanApDung}</td>
                        <td><span className={`tag-status ${item.trangThai === 'ACTIVE' ? 'active' : 'pending'}`}>{item.trangThai}</span></td>
                        <td className="text-right">
                            <button className="btn-ghost" onClick={() => handleOpenEdit(item)}>Sửa</button>
                            <button className="btn-ghost-danger" onClick={() => handleDelete(item.id)}>Xóa</button>
                        </td>
                    </tr>
                    )) : (
                        <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>Không có sản phẩm nào.</td></tr>
                    )}
                </tbody>
                </table>
            )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '700px', maxWidth: '95%',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <h2 style={{marginTop: 0, marginBottom: '25px', fontSize: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                    {isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h2>
                
                <form onSubmit={handleSave}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '15px'}}>
                        <div>
                            <label className="label" style={{fontWeight: '500', marginBottom: '5px', display: 'block'}}>Mã sản phẩm <span style={{color: 'red'}}>*</span></label>
                            <input className="input" name="maSanPham" value={formData.maSanPham} onChange={handleInputChange} placeholder="VD: SP01" required />
                        </div>
                        <div>
                            <label className="label" style={{fontWeight: '500', marginBottom: '5px', display: 'block'}}>Tên sản phẩm <span style={{color: 'red'}}>*</span></label>
                            <input className="input" name="ten" value={formData.ten} onChange={handleInputChange} placeholder="VD: Rau cải thảo" required />
                        </div>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px'}}>
                        <div>
                            <label className="label" style={{fontWeight: '500', marginBottom: '5px', display: 'block'}}>Tiêu chuẩn</label>
                            <input className="input" name="tieuChuanApDung" value={formData.tieuChuanApDung} onChange={handleInputChange} placeholder="VD: VietGAP" />
                        </div>
                        <div>
                            <label className="label" style={{fontWeight: '500', marginBottom: '5px', display: 'block'}}>Trạng thái</label>
                            <select className="input" name="trangThai" value={formData.trangThai} onChange={handleInputChange}>
                                <option value="ACTIVE">Đang kinh doanh</option>
                                <option value="INACTIVE">Ngừng kinh doanh</option>
                            </select>
                        </div>
                    </div>

                    <div style={{marginBottom: '15px', border: '1px dashed #ccc', padding: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9'}}>
                        <label className="label" style={{fontWeight: '500', marginBottom: '10px', display: 'block'}}>Hình ảnh sản phẩm</label>
                        <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                            <div style={{flex: 1}}>
                                <input type="file" onChange={handleImageUpload} accept="image/*" />
                                {uploadingImage && <div style={{fontSize: '12px', color: '#007bff', marginTop: '5px'}}>⏳ Đang tải ảnh lên cloud...</div>}
                            </div>
                            {formData.hinhAnhUrl && (
                                <div style={{width: '80px', height: '80px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'white'}}>
                                    <img src={formData.hinhAnhUrl} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                </div>
                            )}
                        </div>
                        <input type="hidden" name="hinhAnhUrl" value={formData.hinhAnhUrl} />
                    </div>

                    <div style={{marginBottom: '20px'}}>
                        <label className="label" style={{fontWeight: '500', marginBottom: '5px', display: 'block'}}>Mô tả chi tiết</label>
                        <textarea className="input" name="moTa" rows={3} value={formData.moTa} onChange={handleInputChange} placeholder="Mô tả về sản phẩm..." />
                    </div>

                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
                        <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Đóng</button>
                        <button type="submit" className="btn-primary" disabled={uploadingImage}>
                            {uploadingImage ? "Đang xử lý ảnh..." : (isEditing ? "Lưu thay đổi" : "Thêm mới")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </>
  );
}

export default ProductsPage;