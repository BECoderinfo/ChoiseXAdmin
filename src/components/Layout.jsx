import Sidebar from "./sidebar.jsx";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import "./styles/Layout.css";

const Layout = () => {
  return (
    <div className="layout-container">
      <Sidebar />

      <div className="main-content">
        <Header />

        <main className="content-area">
          {/* ⭐ VERY IMPORTANT FOR NESTED ROUTES */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
