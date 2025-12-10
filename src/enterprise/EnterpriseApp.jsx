// src/enterprise/EnterpriseApp.jsx
import { useState } from "react";
import EnterpriseLayout from "./layout/EnterpriseLayout";

import EnterpriseDashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import BatchesPage from "./pages/BatchesPage";
import SupplyChainPage from "./pages/SupplyChainPage";
import StoresPage from "./pages/StoresPage";
import ReportsPage from "./pages/ReportsPage";
import CustomerReportsPage from "./pages/CustomerReportsPage";

function EnterpriseApp({ user, onLogout }) {
  // các màn: dashboard, products, batches, supply, stores, reports, customerReports
  const [currentPage, setCurrentPage] = useState("dashboard");

  const layoutProps = {
    currentPage,
    onNavigate: setCurrentPage,
    onLogout,
    user,
  };

  let pageContent = null;

  switch (currentPage) {
    case "products":
      pageContent = <ProductsPage />;
      break;
    case "batches":
      pageContent = <BatchesPage />;
      break;
    case "supply":
      pageContent = <SupplyChainPage />;
      break;
    case "stores":
      pageContent = <StoresPage />;
      break;
    case "reports":
      pageContent = <ReportsPage />;
      break;
    case "customerReports":
      pageContent = <CustomerReportsPage />;
      break;
    case "dashboard":
    default:
      pageContent = <EnterpriseDashboardPage />;
      break;
  }

  return <EnterpriseLayout {...layoutProps}>{pageContent}</EnterpriseLayout>;
}

export default EnterpriseApp;
