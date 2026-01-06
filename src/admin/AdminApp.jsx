// src/admin/AdminApp.jsx
import { useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import UserManagementPage from "./pages/UserManagementPage";
import EnterpriseManagementPage from "./pages/EnterpriseManagementPage";
import ProductApprovalPage from "./pages/ProductApprovalPage";
import EnterpriseRequestPage from "./pages/EnterpriseRequestPage";

function AdminApp({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");

  const layoutProps = {
    currentPage: page,
    onNavigate: setPage,
    onLogout,
    user,
  };

  if (page === "users") return <UserManagementPage {...layoutProps} />;
  if (page === "enterprises") return <EnterpriseManagementPage {...layoutProps} />;
  if (page === "enterprise-requests") return <EnterpriseRequestPage {...layoutProps} />;
  if (page === "approvals") return <ProductApprovalPage {...layoutProps} />;

  return <DashboardPage {...layoutProps} />;
}

export default AdminApp;
