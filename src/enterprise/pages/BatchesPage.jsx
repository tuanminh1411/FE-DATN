import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Cấu hình base URL
const API_BASE_URL = "http://localhost:5081";
const CURRENT_ENTERPRISE_ID = localStorage.getItem("currentEnterpriseId");

function BatchesPage() {
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State quản lý Modal Thêm/Sửa
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // State quản lý Modal Chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    sanPhamId: "",
    maLo: "",
    ngaySanXuat: "",
    hanSuDung: "",
    soLuong: "",
    tieuChuanApDung: "",
    ketQuaKiemNghiem: "",
    trangThai: "ACTIVE"
  });

  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  }, []);

  // 1. Tải dữ liệu: Sản phẩm + Lô hàng + QR Code
  const fetchData = useCallback(async () => {
    if (!CURRENT_ENTERPRISE_ID) return;

    setLoading(true);
    try {
      // Gọi song song 3 API để tiết kiệm thời gian
      const [productsRes, batchesRes, qrRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/SanPhams/doanh-nghiep/${CURRENT_ENTERPRISE_ID}`),
        axios.get(`${API_BASE_URL}/api/LoHangs/list`),
        axios.get(`${API_BASE_URL}/api/LoHangs/list_qr`) // API lấy danh sách QR
      ]);

      const myProducts = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data?.data || [];
      const allBatches = Array.isArray(batchesRes.data) ? batchesRes.data : batchesRes.data?.data || [];
      const qrList = Array.isArray(qrRes.data) ? qrRes.data : qrRes.data?.data || [];

      setProducts(myProducts);

      // Lọc lô hàng của doanh nghiệp (dựa trên sản phẩm)
      const validProductIds = myProducts.map(p => p.id);
      let myBatches = allBatches.filter(b => validProductIds.includes(b.sanPhamId));

      // --- GHÉP QR CODE VÀO LÔ HÀNG ---
      myBatches = myBatches.map(batch => {
        // Tìm QR code tương ứng với lô hàng này
        const qrInfo = qrList.find(q => q.loHangId === batch.id);
        return {
          ...batch,
          qrImageUrl: qrInfo ? qrInfo.qrImageUrl : null // Gán URL ảnh vào object batch
        };
      });

      setBatches(myBatches);

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ... (Các hàm handleInputChange, handleSave, handleDelete giữ nguyên như cũ) ...
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      id: "", sanPhamId: "", maLo: "", ngaySanXuat: new Date().toISOString().split('T')[0],
      hanSuDung: "", soLuong: "", tieuChuanApDung: "", ketQuaKiemNghiem: "", trangThai: "ACTIVE"
    });
    setShowModal(true);
  };

  const handleOpenEdit = (batch) => {
    setIsEditing(true);
    setFormData({
      id: batch.id, sanPhamId: batch.sanPhamId, maLo: batch.maLo,
      ngaySanXuat: batch.ngaySanXuat ? batch.ngaySanXuat.split('T')[0] : "",
      hanSuDung: batch.hanSuDung ? batch.hanSuDung.split('T')[0] : "",
      soLuong: batch.soLuong, tieuChuanApDung: batch.tieuChuanApDung || "",
      ketQuaKiemNghiem: batch.ketQuaKiemNghiem || "", trangThai: batch.trangThai || "ACTIVE"
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.sanPhamId) { showNotification("Vui lòng chọn sản phẩm", "error"); return; }
    try {
      const payload = {
        sanPhamId: formData.sanPhamId, maLo: formData.maLo, ngaySanXuat: formData.ngaySanXuat,
        hanSuDung: formData.hanSuDung || null, soLuong: Number(formData.soLuong),
        tieuChuanApDung: formData.tieuChuanApDung, ketQuaKiemNghiem: formData.ketQuaKiemNghiem, trangThai: formData.trangThai
      };
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/api/LoHangs/edit/${formData.id}`, payload);
        showNotification("Cập nhật thành công!");
      } else {
        await axios.post(`${API_BASE_URL}/api/LoHangs/Create`, payload);
        showNotification("Tạo lô hàng thành công!");
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      showNotification("Có lỗi xảy ra", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/LoHangs/${id}`);
        showNotification("Đã xóa!");
        fetchData();
      } catch { showNotification("Xóa thất bại!", "error"); }
    }
  };

  // --- MỚI: HÀM MỞ MODAL CHI TIẾT ---
  const handleOpenDetail = (batch) => {
    setSelectedBatch(batch);
    setShowDetailModal(true);
  };

  const getProductName = (id) => {
    const product = products.find(p => p.id === id);
    return product ? product.ten : id;
  };

  const styles = {
    panel: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '24px', overflow: 'hidden' },
    input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce0e4', fontSize: '14px', outline: 'none' },
    label: { fontWeight: '600', marginBottom: '6px', display: 'block', color: '#374151', fontSize: '14px' },
    btnPrimary: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    btnOutline: { padding: '10px 20px', backgroundColor: 'white', color: '#374151', border: '1px solid #dce0e4', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    // Style cho Modal chi tiết
    detailLabel: { color: '#6b7280', fontSize: '13px', marginBottom: '4px' },
    detailValue: { color: '#111827', fontSize: '15px', fontWeight: '500', marginBottom: '16px' },
    qrContainer: { textAlign: 'center', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db', marginTop: '10px' }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Toast Notification */}
      {notification.show && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, padding: '14px 20px', borderRadius: '10px', backgroundColor: '#fff', borderLeft: notification.type === 'success' ? '4px solid #10b981' : '4px solid #ef4444', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            {notification.message}
        </div>
      )}

      {/* Header */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <div>
          <h1 style={{fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0}}>Quản lý Lô hàng</h1>
          <p style={{color: '#6b7280', marginTop: '4px'}}>Theo dõi lô sản xuất và mã QR truy xuất nguồn gốc</p>
        </div>
        <button style={styles.btnPrimary} onClick={handleOpenAdd}>+ Thêm lô hàng</button>
      </div>

      {/* Table */}
      <div style={styles.panel}>
        {loading ? <p style={{textAlign:'center', padding:'20px'}}>⏳ Đang tải...</p> : (
            <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: '0'}}>
                <thead style={{backgroundColor: '#f9fafb'}}>
                    <tr>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb'}}>Mã Lô</th>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb'}}>Sản phẩm</th>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb'}}>Ngày SX / Hạn SD</th>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb'}}>Số lượng</th>
                        <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb'}}>QR Code</th>
                        <th style={{padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb'}}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {batches.map((item) => (
                        <tr key={item.id} style={{borderBottom: '1px solid #f3f4f6', cursor: 'pointer'}} onClick={() => handleOpenDetail(item)}>
                            <td style={{padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold'}}>{item.maLo}</td>
                            <td style={{padding: '12px', borderBottom: '1px solid #eee', color: '#2563eb'}}>{getProductName(item.sanPhamId)}</td>
                            <td style={{padding: '12px', borderBottom: '1px solid #eee', fontSize: '13px'}}>
                                <div>{item.ngaySanXuat ? item.ngaySanXuat.split('T')[0] : '-'}</div>
                                <div style={{color: '#ef4444'}}>{item.hanSuDung ? item.hanSuDung.split('T')[0] : '-'}</div>
                            </td>
                            <td style={{padding: '12px', borderBottom: '1px solid #eee'}}>{item.soLuong}</td>
                            <td style={{padding: '12px', borderBottom: '1px solid #eee'}}>
                                {item.qrImageUrl ? <span style={{fontSize:'20px'}}>📱</span> : <span style={{color:'#ccc'}}>Chưa có</span>}
                            </td>
                            <td style={{padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee'}} onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => handleOpenEdit(item)} style={{marginRight: '10px', color: '#2563eb', border:'none', background:'none', cursor:'pointer'}}>Sửa</button>
                                <button onClick={() => handleDelete(item.id)} style={{color: '#dc2626', border:'none', background:'none', cursor:'pointer'}}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
      </div>

      {/* MODAL THÊM / SỬA (Giữ nguyên logic cũ) */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '650px', maxWidth: '95%' }}>
                <h2 style={{marginTop: 0, marginBottom: '20px'}}>{isEditing ? "Cập nhật lô hàng" : "Thêm lô hàng mới"}</h2>
                <form onSubmit={handleSave}>
                    {/* ... (Phần Form Input giữ nguyên như code trước) ... */}
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                        <div>
                            <label style={styles.label}>Sản phẩm *</label>
                            <select style={styles.input} name="sanPhamId" value={formData.sanPhamId} onChange={handleInputChange} required>
                                <option value="">-- Chọn --</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.ten}</option>)}
                            </select>
                        </div>
                        <div><label style={styles.label}>Mã lô *</label><input style={styles.input} name="maLo" value={formData.maLo} onChange={handleInputChange} required /></div>
                    </div>
                    {/* ... (Các input khác tương tự code cũ) ... */}
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                         <div><label style={styles.label}>Ngày SX *</label><input type="date" style={styles.input} name="ngaySanXuat" value={formData.ngaySanXuat} onChange={handleInputChange} required /></div>
                         <div><label style={styles.label}>Hạn SD</label><input type="date" style={styles.input} name="hanSuDung" value={formData.hanSuDung} onChange={handleInputChange} /></div>
                    </div>
                    <div style={{marginBottom: '15px'}}><label style={styles.label}>Số lượng</label><input type="number" style={styles.input} name="soLuong" value={formData.soLuong} onChange={handleInputChange} /></div>
                    
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
                        <button type="button" style={styles.btnOutline} onClick={() => setShowModal(false)}>Hủy</button>
                        <button type="submit" style={styles.btnPrimary}>Lưu</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- MỚI: MODAL CHI TIẾT LÔ HÀNG & QR CODE --- */}
      {showDetailModal && selectedBatch && (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
        }} onClick={() => setShowDetailModal(false)}>
            <div style={{
                backgroundColor: 'white', padding: '0', borderRadius: '16px', width: '500px', maxWidth: '90%',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden'
            }} onClick={(e) => e.stopPropagation()}>
                
                {/* Header Modal */}
                <div style={{padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2 style={{margin: 0, fontSize: '18px', color: '#111827'}}>Chi tiết Lô hàng: {selectedBatch.maLo}</h2>
                    <button onClick={() => setShowDetailModal(false)} style={{background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280'}}>✕</button>
                </div>

                {/* Body Modal */}
                <div style={{padding: '24px'}}>
                    {/* Phần QR Code nổi bật */}
                    <div style={styles.qrContainer}>
                        {selectedBatch.qrImageUrl ? (
                            <>
                                <img src={selectedBatch.qrImageUrl} alt="QR Code" style={{width: '200px', height: '200px', objectFit: 'contain'}} />
                                <a href={selectedBatch.qrImageUrl} target="_blank" rel="noreferrer" style={{fontSize:'13px', color:'#2563eb', textDecoration:'none'}}>Tải xuống QR</a>
                            </>
                        ) : (
                            <div style={{padding: '40px', color: '#9ca3af'}}>
                                <div style={{fontSize: '40px', marginBottom: '10px'}}>⚠️</div>
                                Chưa có mã QR cho lô hàng này
                            </div>
                        )}
                    </div>

                    {/* Thông tin chi tiết */}
                    <div style={{marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                        <div>
                            <div style={styles.detailLabel}>Sản phẩm</div>
                            <div style={styles.detailValue}>{getProductName(selectedBatch.sanPhamId)}</div>
                        </div>
                        <div>
                            <div style={styles.detailLabel}>Số lượng</div>
                            <div style={styles.detailValue}>{selectedBatch.soLuong}</div>
                        </div>
                        <div>
                            <div style={styles.detailLabel}>Ngày sản xuất</div>
                            <div style={styles.detailValue}>{selectedBatch.ngaySanXuat?.split('T')[0]}</div>
                        </div>
                        <div>
                            <div style={styles.detailLabel}>Hạn sử dụng</div>
                            <div style={{...styles.detailValue, color: '#dc2626'}}>{selectedBatch.hanSuDung?.split('T')[0] || 'Không có'}</div>
                        </div>
                        <div style={{gridColumn: '1 / span 2'}}>
                            <div style={styles.detailLabel}>Tiêu chuẩn áp dụng</div>
                            <div style={styles.detailValue}>{selectedBatch.tieuChuanApDung || 'Không có thông tin'}</div>
                        </div>
                        <div style={{gridColumn: '1 / span 2'}}>
                            <div style={styles.detailLabel}>Kết quả kiểm nghiệm</div>
                            <div style={{...styles.detailValue, background: '#f9fafb', padding: '10px', borderRadius: '6px', fontSize: '14px'}}>
                                {selectedBatch.ketQuaKiemNghiem || 'Chưa cập nhật'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default BatchesPage;