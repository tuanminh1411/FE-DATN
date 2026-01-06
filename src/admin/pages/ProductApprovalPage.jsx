import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../layout/AdminLayout";

// Cấu hình Base URL
const API_BASE_URL = "http://localhost:5081";

function ProductApprovalPage({ currentPage, onNavigate, onLogout }) {
  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [enterprises, setEnterprises] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [noteInput, setNoteInput] = useState("");

  // --- HELPER: Notification (Dùng useCallback để ổn định tham chiếu) ---
  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  }, []);

  // --- 1. API: FETCH DATA (Đã tách bỏ selectedProduct ra khỏi dependency) ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, entRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/SanPhams`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/api/AdminDoanhNghiep`).catch(() => ({ data: [] }))
      ]);

      const prodData = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data?.data || []);
      const entData = Array.isArray(entRes.data) ? entRes.data : (entRes.data?.data || []);

      setProducts(prodData);
      setEnterprises(entData);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      showNotification("Lỗi kết nối server", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]); // Chỉ phụ thuộc vào showNotification (hàm này ko thay đổi)

  // Gọi API khi component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Dependency chuẩn theo ESLint

  // --- 2. EFFECT RIÊNG: Cập nhật lại selectedProduct khi danh sách products thay đổi ---
  useEffect(() => {
    if (selectedProduct && products.length > 0) {
        // Tìm lại sản phẩm đang chọn trong danh sách mới tải về
        const updatedItem = products.find(p => p.id === selectedProduct.id);
        
        // Chỉ update nếu dữ liệu thực sự thay đổi để tránh loop
        if (updatedItem && JSON.stringify(updatedItem) !== JSON.stringify(selectedProduct)) {
            setSelectedProduct(updatedItem);
        }
    }
  }, [products, selectedProduct]); // Chạy khi products thay đổi

  // --- 3. XỬ LÝ ACTION (DUYỆT/TỪ CHỐI) ---
  const handleUpdateStatus = async (status) => {
    if (!selectedProduct) return;
    if (!window.confirm(`Xác nhận chuyển trạng thái thành "${status}"?`)) return;

    setProcessing(true);
    try {
      const payload = {
        ...selectedProduct,
        trangThai: status,
        doanhNghiepId: selectedProduct.doanhNghiepId,
        ten: selectedProduct.ten,
        gia: selectedProduct.gia,
        soLuong: selectedProduct.soLuong,
        maSanPham: selectedProduct.maSanPham
      };

      await axios.put(`${API_BASE_URL}/api/SanPhams/${selectedProduct.id}`, payload);
      showNotification(`Cập nhật thành công: ${status}`, "success");
      
      // Reload lại dữ liệu
      fetchData(); 
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Cập nhật thất bại!";
      showNotification(msg, "error");
    } finally {
      setProcessing(false);
    }
  };

  // --- 4. LOGIC FILTER ---
  
  // Viết hàm lấy tên DN đơn giản, không cần useMemo phức tạp
  const getEnterpriseName = (entId) => {
      const ent = enterprises.find(e => e.id === entId);
      return ent ? (ent.tenDoanhNghiep || ent.ten) : "Đang tải...";
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchStatus = filterStatus === "ALL" || p.trangThai === filterStatus;
      
      const term = searchTerm.toLowerCase();
      const pName = p.ten ? p.ten.toLowerCase() : "";
      const pCode = p.maSanPham ? p.maSanPham.toLowerCase() : "";
      
      // Lấy tên DN ngay tại đây để filter
      const entName = (enterprises.find(e => e.id === p.doanhNghiepId)?.tenDoanhNghiep || "").toLowerCase();

      const matchSearch = pName.includes(term) || pCode.includes(term) || entName.includes(term);

      return matchStatus && matchSearch;
    });
  }, [products, filterStatus, searchTerm, enterprises]); // Thêm enterprises vào deps

  // --- Styles Helper ---
  const getBadgeClass = (status) => {
    if (status === "ACTIVE") return "badge-success";
    if (status === "PENDING") return "badge-warning";
    if (status === "REJECTED") return "badge-danger";
    return "badge-info";
  };

  const getStatusLabel = (status) => {
    if (status === "ACTIVE") return "Đã duyệt";
    if (status === "PENDING") return "Chờ duyệt";
    if (status === "REJECTED") return "Từ chối";
    return status;
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout}>
      
      {/* Toast Notification */}
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
          <h1 className="page-title">Duyệt đăng ký sản phẩm</h1>
          <p className="page-subtitle">Kiểm tra hồ sơ và tiêu chuẩn sản phẩm.</p>
        </div>
        <div className="page-actions">
          <select 
            className="select-sm" 
            value={filterStatus} 
            onChange={(e) => { setFilterStatus(e.target.value); setSelectedProduct(null); }}
          >
            <option value="PENDING">Chờ duyệt (PENDING)</option>
            <option value="ACTIVE">Đã duyệt (ACTIVE)</option>
            <option value="REJECTED">Bị từ chối (REJECTED)</option>
            <option value="ALL">Tất cả</option>
          </select>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          className="input-search"
          placeholder="Tìm tên SP, Mã SP, Doanh nghiệp..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn-primary-sm" onClick={fetchData}>Làm mới</button>
      </div>

      <div className="grid-2">
        {/* PANEL DANH SÁCH */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Danh sách yêu cầu</div>
              <div className="panel-subtitle">Tìm thấy {filteredProducts.length} kết quả.</div>
            </div>
          </div>

          <div className="table-container" style={{maxHeight: '600px', overflowY: 'auto'}}>
            {loading ? <div style={{padding:'40px', textAlign:'center', color:'#666'}}>⏳ Đang tải dữ liệu...</div> : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Doanh nghiệp</th>
                    <th>Giá / Số lượng</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? filteredProducts.map(p => (
                    <tr 
                        key={p.id} 
                        className={selectedProduct?.id === p.id ? "row-highlight" : ""}
                        onClick={() => setSelectedProduct(p)}
                        style={{cursor: 'pointer'}}
                    >
                      <td>
                        <div style={{fontWeight: 600, color: '#2563eb'}}>{p.ten || "Chưa đặt tên"}</div>
                        <div className="cell-sub">Mã: {p.maSanPham || '---'}</div>
                      </td>
                      <td>
                        <div style={{fontSize:'13px', fontWeight: 500}}>{getEnterpriseName(p.doanhNghiepId)}</div>
                      </td>
                      <td>
                        <div style={{fontSize: '13px'}}>
                            {p.gia?.toLocaleString()} đ
                        </div>
                        <div className="cell-sub">SL: {p.soLuong}</div>
                      </td>
                      <td>
                        <span className={`badge ${getBadgeClass(p.trangThai)}`}>
                          {getStatusLabel(p.trangThai)}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" style={{textAlign:'center', padding:'30px', color: '#888'}}>Không có dữ liệu phù hợp</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* PANEL CHI TIẾT */}
        <div className="panel">
          {selectedProduct ? (
            <div>
                <div className="panel-header">
                    <div>
                        <div className="panel-title">Chi tiết sản phẩm</div>
                        <div className="panel-subtitle">
                            ID: {selectedProduct.id ? selectedProduct.id.substring(0,8) : '...'}...
                        </div>
                    </div>
                </div>

                <div className="product-detail-grid">
                    <div className="product-main-info">
                        
                        {/* Ảnh sản phẩm */}
                        {selectedProduct.hinhAnhUrl && (
                            <div style={{textAlign:'center', marginBottom:'20px', padding:'10px', border:'1px solid #eee', borderRadius:'8px'}}>
                                <img 
                                    src={selectedProduct.hinhAnhUrl} 
                                    alt="Ảnh sản phẩm" 
                                    style={{maxWidth:'100%', maxHeight:'200px', objectFit:'contain'}} 
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            </div>
                        )}

                        <div className="detail-block">
                            <div className="detail-label">Thông tin chung</div>
                            <div className="detail-value">
                                <div style={{fontSize:'16px', fontWeight:'bold', color:'#111827', marginBottom:'5px'}}>
                                    {selectedProduct.ten}
                                </div>
                                - Doanh nghiệp: <strong>{getEnterpriseName(selectedProduct.doanhNghiepId)}</strong> <br />
                                - Mã SP: {selectedProduct.maSanPham} <br />
                                - Giá: <span style={{color:'#d97706', fontWeight:'bold'}}>{selectedProduct.gia?.toLocaleString()} đ</span> <br />
                                - Số lượng: {selectedProduct.soLuong} {selectedProduct.donViTinh || ''}
                            </div>
                        </div>

                        <div className="detail-block">
                            <div className="detail-label">Tiêu chuẩn & Hạn dùng</div>
                            <div className="detail-value">
                                - Tiêu chuẩn: {selectedProduct.tieuChuanApDung || "Chưa cập nhật"} <br />
                                - Ngày SX: {selectedProduct.ngaySanXuat ? selectedProduct.ngaySanXuat.split('T')[0] : '---'} <br />
                                - Hạn SD: {selectedProduct.hanSuDung ? selectedProduct.hanSuDung.split('T')[0] : '---'}
                            </div>
                        </div>
                        
                        {/* QR Code */}
                        {selectedProduct.qrImageUrl && (
                            <div className="detail-block">
                                <div className="detail-label">Mã QR Truy xuất</div>
                                <div style={{marginTop:'5px'}}>
                                    <img src={selectedProduct.qrImageUrl} alt="QR Code" style={{width:'80px', height:'80px'}} />
                                    <div style={{fontSize:'12px', color:'#6b7280'}}>QR tự động</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="product-actions" style={{borderTop:'1px solid #eee', paddingTop:'20px', marginTop:'20px'}}>
                        <div className="detail-block">
                            <div className="detail-label">Ghi chú (Admin)</div>
                            <textarea
                                className="note-input"
                                placeholder="Nhập lý do hoặc ghi chú..."
                                rows={3}
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                            />
                        </div>

                        <div className="action-row" style={{display:'flex', gap:'10px', justifyContent:'flex-end'}}>
                            {selectedProduct.trangThai !== "REJECTED" && (
                                <button 
                                    className="btn-ghost-danger" 
                                    style={{color:'#dc2626', border:'1px solid #dc2626'}}
                                    onClick={() => handleUpdateStatus("REJECTED")}
                                    disabled={processing}
                                >
                                    ⛔ Từ chối
                                </button>
                            )}
                            
                            {selectedProduct.trangThai !== "ACTIVE" && (
                                <button 
                                    className="btn-primary"
                                    onClick={() => handleUpdateStatus("ACTIVE")}
                                    disabled={processing}
                                >
                                    ✅ Duyệt & Phát hành
                                </button>
                            )}
                        </div>
                        {processing && <div style={{textAlign:'right', fontSize:'12px', color:'#2563eb', marginTop:'5px'}}>Đang xử lý...</div>}
                    </div>
                </div>
            </div>
          ) : (
            <div style={{padding:'40px', textAlign:'center', color:'#9ca3af'}}>
                 <div style={{fontSize:'40px', marginBottom:'10px'}}>📦</div>
                 Chọn một sản phẩm để xem chi tiết
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default ProductApprovalPage;