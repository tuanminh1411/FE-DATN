// src/App.jsx
import { useState } from "react";
import "./styles/base.css";
import "./styles/admin.css";
import "./styles/enterprise.css";

import LoginPage from "./auth/LoginPage";
import AdminApp from "./admin/AdminApp";
import EnterpriseApp from "./enterprise/EnterpriseApp";

function detectRole(user) {
  if (user?.isAdmin || user?.roles?.includes("ADMIN")) return "admin";
  if (user?.isDoanhNghiep || user?.roles?.includes("DOANH_NGHIEP"))
    return "enterprise";
  return "enterprise";
}

function getInitialAuth() {
  try {
    const raw = sessionStorage.getItem("auth_state");
    if (!raw) {
      return {
        isLoggedIn: false,
        role: null,
        userId: null,
        token: null,
        user: null,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      isLoggedIn: true,
      ...parsed,
    };
  } catch {
    return {
      isLoggedIn: false,
      role: null,
      userId: null,
      token: null,
      user: null,
    };
  }
}

function App() {
  const [auth, setAuth] = useState(getInitialAuth);

  // { user, token } lấy từ LoginPage
  const handleLoginSuccess = ({ user, token }) => {
    const role = detectRole(user);

    const newAuth = {
      role,
      userId: user.id,
      token,
      user,          // user vẫn giữ đủ: id, hoTen, email, roles, ...
    };

    setAuth({
      isLoggedIn: true,
      ...newAuth,
    });

    sessionStorage.setItem("auth_state", JSON.stringify(newAuth));
  };

  const handleLogout = () => {
    setAuth({
      isLoggedIn: false,
      role: null,
      userId: null,
      token: null,
      user: null,
    });
    sessionStorage.removeItem("auth_state");
  };

  if (!auth.isLoggedIn || !auth.role) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (auth.role === "admin") {
    return (
      <AdminApp
        user={auth.user}      // bên trong vẫn truy cập user.hoTen
        token={auth.token}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <EnterpriseApp
      user={auth.user}        // bên trong vẫn truy cập user.hoTen
      token={auth.token}
      onLogout={handleLogout}
    />
  );
}

export default App;
