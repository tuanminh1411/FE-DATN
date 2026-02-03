import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../layout/AdminLayout";

// Cấu hình Base URL
const API_BASE_URL = "http://localhost:5081";

function EnterpriseRequestPage({ currentPage, onNavigate, onLogout }) {
  // --- STATE ---
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Notification
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  // Filter & Search
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [searchTerm, setSearchTerm] = useState("");

  // Selected Item
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [noteInput, setNoteInput] = useState("");

  // --- HELPER: Notification ---
  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  }, []);

  // --- 1. API: LẤY DANH SÁCH YÊU CẦU ---
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      // Gọi endpoint Admin để lấy toàn bộ danh sách
      const response = await axios.get(`${API_BASE_URL}/api/YeuCauDangKyDn/Admin`);
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      
      setRequests(data);

      // Refresh item đang chọn nếu có
      if (selectedRequest) {
        const updated = data.find(r => r.id === selectedRequest.id);
        if (updated && JSON.stringify(updated) !== JSON.stringify(selectedRequest)) {
            setSelectedRequest(updated);
            setNoteInput(updated.ghiChu || ""); // Load ghi chú cũ lên form
        }
      }
    } catch (error) {
      console.error("Lỗi tải yêu cầu:", error);
      showNotification("Không thể tải danh sách yêu cầu", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification, selectedRequest]); 

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // --- 2. API: XỬ LÝ YÊU CẦU ---
  const handleProcessRequest = async (status) => {
    if (!selectedRequest) return;
    
    const actionName = status === "ACTIVE" ? "DUYỆT" : (status === "REJECTED" ? "TỪ CHỐI" : "CẬP NHẬT");
    if (!window.confirm(`Bạn có chắc muốn ${actionName} yêu cầu này?`)) return;

    setProcessing(true);
    try {
      // Payload cập nhật trạng thái và ghi chú
      const payload = {
        ...selectedRequest,
        trangThai: status,
        ghiChu: noteInput // Gửi ghi chú lên server
      };

      await axios.put(`${API_BASE_URL}/api/YeuCauDangKyDn/Admin/${selectedRequest.id}`, payload);
      
      showNotification(`Đã ${actionName.toLowerCase()} thành công!`, "success");
      fetchRequests(); 

    } catch (error) {
      console.error("Lỗi xử lý:", error);
      const msg = error.response?.data?.message || "Có lỗi xảy ra.";
      showNotification(msg, "error");
    } finally {
      setProcessing(false);
    }
  };

  // --- 3. API: XÓA YÊU CẦU ---
  const handleDeleteRequest = async () => {
    if (!selectedRequest) return;
    if (!window.confirm("Cảnh báo: Xóa vĩnh viễn yêu cầu này?")) return;

    try {
        await axios.delete(`${API_BASE_URL}/api/YeuCauDangKyDn/${selectedRequest.id}`);
        showNotification("Đã xóa yêu cầu!", "success");
        setSelectedRequest(null);
        fetchRequests();
    } catch (error) {
        console.error(error);
        showNotification("Xóa thất bại.", "error");
    }
  };

  // --- 4. FILTER ---
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchStatus = filterStatus === "ALL" || req.trangThai === filterStatus;
      
      const term = searchTerm.toLowerCase();
      // Ánh xạ đúng trường dữ liệu từ JSON
      const name = req.tenDoanhNghiep ? req.tenDoanhNghiep.toLowerCase() : "";
      const mst = req.maSoThue ? req.maSoThue.toLowerCase() : "";
      const email = req.email ? req.email.toLowerCase() : "";

      const matchSearch = name.includes(term) || mst.includes(term) || email.includes(term);
      return matchStatus && matchSearch;
    });
  }, [requests, filterStatus, searchTerm]);

  // --- UI Helpers ---
  const getBadgeClass = (status) => {
    if (status === "ACTIVE") return "badge-success";
    if (status === "PENDING") return "badge-warning";
    if (status === "REJECTED") return "badge-danger";
    return "badge-info";
  };

  const getStatusLabel = (status) => {
    if (status === "ACTIVE") return "Đã duyệt";
    if (status === "PENDING") return "Chờ duyệt";
    if (status === "REJECTED") return "Đã từ chối";
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
          <h1 className="page-title">Yêu cầu đăng ký Doanh nghiệp</h1>
          <p className="page-subtitle">Duyệt hồ sơ doanh nghiệp đăng ký mới.</p>
        </div>
        <div className="page-actions">
           <div style={{display:'flex', gap:'5px', background:'#e2e8f0', padding:'4px', borderRadius:'8px'}}>
              {['PENDING', 'ACTIVE', 'REJECTED', 'ALL'].map(status => (
                  <button 
                    key={status}
                    onClick={() => { setFilterStatus(status); setSelectedRequest(null); }}
                    style={{
                        padding:'6px 12px', borderRadius:'6px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:600,
                        backgroundColor: filterStatus === status ? 'white' : 'transparent',
                        color: filterStatus === status ? '#2563eb' : '#64748b',
                        boxShadow: filterStatus === status ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    {status === 'PENDING' ? 'Chờ duyệt' : status === 'ACTIVE' ? 'Đã duyệt' : status === 'REJECTED' ? 'Từ chối' : 'Tất cả'}
                  </button>
              ))}
           </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          className="input-search"
          placeholder="Tìm tên DN, MST, Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn-primary-sm" onClick={fetchRequests}>Làm mới</button>
      </div>

      <div className="grid-2">
        {/* LIST PANEL */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Danh sách yêu cầu</div>
              <div className="panel-subtitle">Hiển thị {filteredRequests.length} hồ sơ.</div>
            </div>
          </div>

          <div className="table-container" style={{maxHeight: '600px', overflowY: 'auto'}}>
            {loading ? <div style={{padding:'40px', textAlign:'center', color:'#666'}}>⏳ Đang tải dữ liệu...</div> : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Doanh nghiệp</th>
                    <th>Mã số thuế</th>
                    <th>Ngày gửi</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length > 0 ? filteredRequests.map(req => (
                    <tr 
                        key={req.id} 
                        className={selectedRequest?.id === req.id ? "row-highlight" : ""}
                        onClick={() => { setSelectedRequest(req); setNoteInput(req.ghiChu || ""); }}
                        style={{cursor: 'pointer'}}
                    >
                      <td>
                        {/* Hiển thị tên DN từ JSON */}
                        <div style={{fontWeight: 600, color: '#1e293b'}}>{req.tenDoanhNghiep || "Không có tên"}</div>
                        <div className="cell-sub">{req.email || '---'}</div>
                      </td>
                      <td>
                        <div style={{fontFamily:'monospace', fontSize:'13px'}}>{req.maSoThue}</div>
                      </td>
                      <td>
                        <div style={{fontSize: '13px', color:'#64748b'}}>
                            {req.createdAt ? new Date(req.createdAt).toLocaleDateString('vi-VN') : '---'}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getBadgeClass(req.trangThai)}`}>
                          {getStatusLabel(req.trangThai)}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" style={{textAlign:'center', padding:'30px', color: '#94a3b8'}}>Không có yêu cầu nào</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* DETAIL PANEL */}
        <div className="panel">
          {selectedRequest ? (
            <div>
                <div className="panel-header">
                    <div>
                        <div className="panel-title">Chi tiết hồ sơ</div>
                        <div className="panel-subtitle">ID: {selectedRequest.id.substring(0,8)}...</div>
                    </div>
                </div>

                <div className="product-detail-grid">
                    <div className="product-main-info">
                        {/* Thông tin chính khớp JSON */}
                        <div className="detail-block">
                            <div className="detail-label">Thông tin doanh nghiệp</div>
                            <div className="detail-value">
                                <div style={{fontSize:'18px', fontWeight:'bold', color:'#2563eb', marginBottom:'8px'}}>
                                    {selectedRequest.tenDoanhNghiep}
                                </div>
                                - Mã số thuế: <strong>{selectedRequest.maSoThue}</strong> <br />
                                - Email: {selectedRequest.email} <br />
                                - SĐT: {selectedRequest.dienThoai}
                            </div>
                        </div>

                        {/* Thông tin bổ sung */}
                        <div className="detail-block">
                            <div className="detail-label">Địa chỉ & Thời gian</div>
                            <div className="detail-value">
                                - Địa chỉ: {selectedRequest.diaChi || "Chưa cập nhật"} <br />
                                - Ngày tạo: {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString('vi-VN') : '---'} <br />
                                - Cập nhật lần cuối: {selectedRequest.updatedAt ? new Date(selectedRequest.updatedAt).toLocaleString('vi-VN') : '---'}
                            </div>
                        </div>

                        <div className="detail-block" style={{background:'#f8fafc', padding:'10px', borderRadius:'6px'}}>
                            <div className="detail-label">Trạng thái hồ sơ</div>
                            <div className="detail-value" style={{fontSize:'14px', fontWeight:600, color: selectedRequest.trangThai === 'ACTIVE' ? 'green' : '#d97706'}}>
                                {selectedRequest.trangThai}
                            </div>
                        </div>
                    </div>

                    {/* Phần xử lý */}
                    <div className="product-actions" style={{borderTop:'1px solid #eee', paddingTop:'20px', marginTop:'20px'}}>
                        <div className="detail-block">
                            <div className="detail-label">Ghi chú xử lý (Admin Note)</div>
                            <textarea
                                className="note-input"
                                placeholder="Nhập lý do từ chối hoặc ghi chú..."
                                rows={3}
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                            />
                        </div>

                        <div className="action-row" style={{display:'flex', gap:'10px', flexWrap:'wrap', justifyContent:'flex-end'}}>
                            {/* Nút Xóa */}
                            <button 
                                className="btn-ghost-danger" 
                                style={{marginRight:'auto'}}
                                onClick={handleDeleteRequest}
                            >
                                Xóa
                            </button>

                            {/* Nút Từ chối */}
                            {selectedRequest.trangThai !== "REJECTED" && (
                                <button 
                                    className="btn-ghost-danger" 
                                    style={{color:'#dc2626', border:'1px solid #dc2626'}}
                                    onClick={() => handleProcessRequest("REJECTED")}
                                    disabled={processing}
                                >
                                    Từ chối
                                </button>
                            )}
                            
                            {/* Nút Duyệt */}
                            {selectedRequest.trangThai !== "ACTIVE" && (
                                <button 
                                    className="btn-primary"
                                    onClick={() => handleProcessRequest("ACTIVE")}
                                    disabled={processing}
                                >
                                    Duyệt & Kích hoạt
                                </button>
                            )}

                             {/* Nút Cập nhật Ghi chú (Khi đã active rồi) */}
                             {selectedRequest.trangThai === "ACTIVE" && (
                                <button 
                                    className="btn-primary"
                                    style={{background:'#475569'}}
                                    onClick={() => handleProcessRequest("ACTIVE")}
                                    disabled={processing}
                                >
                                    Lưu ghi chú
                                </button>
                            )}
                        </div>
                        {processing && <div style={{textAlign:'right', fontSize:'12px', color:'#2563eb', marginTop:'5px'}}>Đang xử lý...</div>}
                    </div>
                </div>
            </div>
          ) : (
            <div style={{padding:'60px 40px', textAlign:'center', color:'#9ca3af'}}>
                 <div style={{fontSize:'40px', marginBottom:'15px'}}>📝</div>
                 <div style={{fontSize:'16px', fontWeight:500}}>Chọn hồ sơ để xem chi tiết</div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default EnterpriseRequestPage;