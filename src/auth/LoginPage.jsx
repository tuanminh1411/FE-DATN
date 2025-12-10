// src/auth/LoginPage.jsx
import { useState } from "react";

function LoginPage({ onLoginSuccess, onRegister }) {
  const [form, setForm] = useState({
    emailOrPhone: "",
    matKhau: "",
    rememberMe: true,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.emailOrPhone || !form.matKhau) {
      setError("Vui lòng nhập đầy đủ Email/Số điện thoại và Mật khẩu.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch("http://localhost:5081/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailOrPhone: form.emailOrPhone,
          matKhau: form.matKhau,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Đăng nhập thất bại.");
      }

      // Dạng JSON giống screenshot:
      // { success, message, data: { user: {...}, token: "...", expiresAt: "..." } }
      const { user, token } = result.data || {};

      if (!user || !token) {
        throw new Error("Phản hồi từ server không hợp lệ.");
      }

      // Gửi lên App.jsx: user + token
      onLoginSuccess && onLoginSuccess({ user, token });
    } catch (err) {
      console.error(err);
      setError(err.message || "Đăng nhập thất bại, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterClick = () => {
    if (onRegister) {
      onRegister();
    } else {
      alert("Nút đăng ký doanh nghiệp: sẽ nối với màn đăng ký / API sau.");
    }
  };

  return (
    <div className="auth-layout">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div>
            <div className="system-name">Đăng nhập</div>
            <div className="system-subtitle">
              Hệ thống truy xuất nguồn gốc sản phẩm
            </div>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email / Số điện thoại</label>
            <input
              type="text"
              name="emailOrPhone"
              value={form.emailOrPhone}
              onChange={handleChange}
              placeholder="Email hoặc Số điện thoại"
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              name="matKhau"
              value={form.matKhau}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          <div className="form-footer">
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleChange}
              />
              <span>Nhớ đăng nhập</span>
            </label>

            <button
              type="button"
              className="link-button"
              onClick={() =>
                alert("Tính năng quên mật khẩu sẽ được triển khai sau.")
              }
            >
              Quên mật khẩu?
            </button>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* DÒNG ĐĂNG KÝ Ở DƯỚI CÙNG */}
        <div className="login-register-bottom">
          <span>Doanh nghiệp chưa có tài khoản?</span>
          <button
            type="button"
            className="link-button"
            onClick={handleRegisterClick}
          >
            Đăng ký doanh nghiệp
          </button>
        </div>

        <div className="login-footer">
          © {new Date().getFullYear()} Hệ thống truy xuất nguồn gốc sản phẩm
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
