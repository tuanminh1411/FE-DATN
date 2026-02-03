import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5081";
const CURRENT_ENTERPRISE_ID = localStorage.getItem("currentEnterpriseId");

// 1. ĐỊNH NGHĨA DANH SÁCH LOẠI SỰ KIỆN KHỚP VỚI DATABASE
const EVENT_TYPES = [
  { code: "SX", label: "Sản xuất" },
  { code: "KHO", label: "Nhập kho" },
  { code: "DONG_GOI", label: "Đóng gói" },
  { code: "VAN_CHUYEN", label: "Vận chuyển" },
  { code: "PHAN_PHOI", label: "Phân phối" },
  { code: "BAN_LE", label: "Bán lẻ" },
  { code: "TRA_HANG", label: "Trả hàng" },
  { code: "KHAC", label: "Khác" }
];

function SupplyPage() {
  const [batches, setBatches] = useState([]); 
  const [selectedBatchId, setSelectedBatchId] = useState(""); 
  const [events, setEvents] = useState([]); 
  const [locations, setLocations] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    loHangId: "",
    loaiSuKien: "SX", // Đặt mặc định là mã đầu tiên trong DB
    thoiGian: "",
    donViThucHien: "",
    diaDiemId: "", 
    taiLieuDinhKemUrl: "",
    moTa: ""
  });

  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  // Helper: Lấy tên loại sự kiện từ Mã (để hiển thị đẹp hơn trên timeline)
  const getEventTypeName = (code) => {
    const type = EVENT_TYPES.find(t => t.code === code);
    return type ? type.label : code; // Nếu không tìm thấy thì hiện mã gốc
  };

  // Helper: Lấy tên địa điểm
  const getLocationName = (id) => {
    const loc = locations.find(l => l.id === id);
    return loc ? loc.ten : id; 
  };

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/LoHangs/list`);
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setBatches(data); 
      } catch (error) {
        console.error("Lỗi tải lô hàng:", error);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/DiaDiems`);
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setLocations(data);
      } catch (error) {
        console.error("Lỗi tải danh sách địa điểm:", error);
      }
    };

    fetchBatches();
    fetchLocations();
  }, []);

  useEffect(() => {
    if (!selectedBatchId) {
        setEvents([]);
        return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/SuKienChuoiCungUngs/lo-hang/${selectedBatchId}`);
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setEvents(data.sort((a, b) => new Date(b.thoiGian) - new Date(a.thoiGian)));
      } catch (error) {
        console.error("Lỗi tải sự kiện:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedBatchId]);

  const handleOpenAdd = () => {
    if (!selectedBatchId) {
        showNotification("Vui lòng chọn lô hàng trước!", "error");
        return;
    }
    
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const currentDateTime = now.toISOString().slice(0, 16);

    setFormData({
        loHangId: selectedBatchId,
        loaiSuKien: "SX", // Reset về mã mặc định đúng trong DB
        thoiGian: currentDateTime, 
        donViThucHien: "",
        diaDiemId: "",
        taiLieuDinhKemUrl: "",
        moTa: ""
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
          ...formData,
          thoiGian: new Date(formData.thoiGian).toISOString(),
          taiLieuDinhKemUrl: formData.taiLieuDinhKemUrl || null,
          moTa: formData.moTa || null
      };

      console.log("Dữ liệu chuẩn bị gửi xuống Backend:", payload);

      await axios.post(`${API_BASE_URL}/api/SuKienChuoiCungUngs`, payload);
      
      showNotification("Thêm sự kiện thành công!");
      setShowModal(false);
      
      const res = await axios.get(`${API_BASE_URL}/api/SuKienChuoiCungUngs/lo-hang/${selectedBatchId}`);
      const newData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setEvents(newData.sort((a, b) => new Date(b.thoiGian) - new Date(a.thoiGian)));
      
    } catch (error) {
      console.error("Lỗi thêm sự kiện:", error);
      showNotification("Lỗi khi thêm sự kiện", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const styles = {
    panel: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '24px' },
    timelineItem: { display: 'flex', gap: '15px', paddingBottom: '20px', borderLeft: '2px solid #e5e7eb', paddingLeft: '20px', position: 'relative' },
    dot: { width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3b82f6', position: 'absolute', left: '-7px', top: '0' },
    date: { fontSize: '13px', color: '#6b7280', marginBottom: '4px' },
    title: { fontSize: '16px', fontWeight: '600', color: '#111827' },
    desc: { fontSize: '14px', color: '#374151', marginTop: '4px', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '8px' },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #dce0e4', marginBottom: '10px', boxSizing: 'border-box' },
    label: { fontWeight: '600', fontSize: '14px', marginBottom: '5px', display: 'block', color: '#374151' },
    btnPrimary: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: '30px', borderRadius: '15px', width: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Thông báo Toast */}
      {notification.show && (
        <div style={{position: 'fixed', top: '24px', right: '24px', padding: '12px 20px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderLeft: `4px solid ${notification.type === 'success' ? '#10b981' : '#ef4444'}`, zIndex:999}}>
            {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '24px'}}>
        <div>
            <h1 style={{fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0'}}>Chuỗi cung ứng</h1>
            <p style={{color: '#6b7280', margin: 0}}>Theo dõi hành trình sản phẩm theo lô hàng</p>
        </div>
        
        <select 
            style={{padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', minWidth: '250px', outline: 'none'}}
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
        >
            <option value="">-- Chọn lô hàng để xem --</option>
            {batches.map(b => (
                <option key={b.id} value={b.id}>{b.maLo} (SP: {b.sanPhamId})</option>
            ))}
        </select>
      </div>

      {/* Panel Timeline */}
      <div style={styles.panel}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h3 style={{margin: 0, color: '#111827'}}>Dòng sự kiện (Timeline)</h3>
            <button style={{...styles.btnPrimary, opacity: selectedBatchId ? 1 : 0.5, cursor: selectedBatchId ? 'pointer' : 'not-allowed'}} onClick={handleOpenAdd} disabled={!selectedBatchId}>
                + Thêm sự kiện
            </button>
        </div>

        {!selectedBatchId ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#9ca3af'}}>
                <div style={{fontSize: '40px', marginBottom: '10px'}}>🚚</div>
                Vui lòng chọn một lô hàng ở góc trên bên phải
            </div>
        ) : loading ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#6b7280'}}>⏳ Đang tải dữ liệu...</div>
        ) : events.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#9ca3af'}}>Lô hàng này chưa có sự kiện nào.</div>
        ) : (
            <div style={{marginTop: '20px', paddingLeft: '10px'}}>
                {events.map((ev, idx) => (
                    <div key={idx} style={styles.timelineItem}>
                        <div style={styles.dot}></div>
                        <div style={{flex: 1}}>
                            <div style={styles.date}>
                                {new Date(ev.thoiGian).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </div>
                            {/* SỬ DỤNG HÀM GET NAME ĐỂ HIỂN THỊ TÊN SỰ KIỆN THAY VÌ MÃ */}
                            <div style={styles.title}>{getEventTypeName(ev.loaiSuKien)}</div>
                            <div style={{fontSize: '13px', color: '#059669', fontWeight: '500', marginTop: '2px'}}>
                                🏢 Đơn vị: {ev.donViThucHien || "Chưa cập nhật"} 
                                {ev.diaDiemId && ` | 📍 Tại: ${getLocationName(ev.diaDiemId)}`}
                            </div>
                            {ev.moTa && <div style={styles.desc}>{ev.moTa}</div>}
                            {ev.taiLieuDinhKemUrl && (
                                <div style={{marginTop: '5px'}}>
                                    <a href={ev.taiLieuDinhKemUrl} target="_blank" rel="noreferrer" style={{fontSize: '12px', color: '#2563eb'}}>📎 Xem tài liệu đính kèm</a>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Modal Form Thêm Sự Kiện */}
      {showModal && (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <h2 style={{marginTop: 0, marginBottom: '20px', fontSize: '20px', color: '#111827'}}>Thêm sự kiện mới</h2>
                <form onSubmit={handleSave}>
                    <div style={{marginBottom: '15px'}}>
                        <label style={styles.label}>Loại sự kiện</label>
                        {/* SELECT BOX ĐÃ ĐƯỢC CẬP NHẬT */}
                        <select style={styles.input} name="loaiSuKien" value={formData.loaiSuKien} onChange={handleInputChange}>
                            {EVENT_TYPES.map((type) => (
                                <option key={type.code} value={type.code}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{marginBottom: '15px'}}>
                        <label style={styles.label}>Thời gian thực hiện</label>
                        <input type="datetime-local" style={styles.input} name="thoiGian" value={formData.thoiGian} onChange={handleInputChange} required />
                    </div>

                    <div style={{marginBottom: '15px'}}>
                        <label style={styles.label}>Đơn vị thực hiện</label>
                        <input style={styles.input} name="donViThucHien" value={formData.donViThucHien} onChange={handleInputChange} placeholder="VD: Công ty Vận Tải A" />
                    </div>

                    <div style={{marginBottom: '15px'}}>
                        <label style={styles.label}>Địa điểm diễn ra</label>
                        <select 
                            style={styles.input} 
                            name="diaDiemId" 
                            value={formData.diaDiemId} 
                            onChange={handleInputChange}
                        >
                            <option value="">-- Chọn địa điểm --</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.ten}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{marginBottom: '15px'}}>
                        <label style={styles.label}>Link tài liệu / Hình ảnh (URL)</label>
                        <input style={styles.input} name="taiLieuDinhKemUrl" value={formData.taiLieuDinhKemUrl} onChange={handleInputChange} placeholder="https://..." />
                    </div>

                    <div style={{marginBottom: '20px'}}>
                        <label style={styles.label}>Mô tả chi tiết</label>
                        <textarea style={{...styles.input, height: '80px', resize: 'vertical'}} name="moTa" value={formData.moTa} onChange={handleInputChange} placeholder="Ghi chú thêm về sự kiện..." />
                    </div>

                    <div style={{textAlign: 'right', borderTop: '1px solid #eee', paddingTop: '15px'}}>
                        <button type="button" onClick={() => setShowModal(false)} style={{marginRight: '10px', padding: '10px 20px', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', color: '#374151'}}>Hủy bỏ</button>
                        <button type="submit" style={styles.btnPrimary}>Lưu sự kiện</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

export default SupplyPage;