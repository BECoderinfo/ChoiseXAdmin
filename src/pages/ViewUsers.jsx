import { useEffect, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import {
  Users,
  UserCheck,
  Package,
  IndianRupee,
  Download,
  Search,
  Eye,
  Mail,
  UserX,
  UserPlus,
  ShoppingCart,
} from "lucide-react";
import "./styles/ViewUsers.css";
import { fetchAdminUsers } from "../api/users";

export default function ViewUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const { enqueueSnackbar } = useSnackbar();

  const handleStatusToggle = (userId) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "Active" ? "Inactive" : "Active",
            }
          : user
      )
    );
    enqueueSnackbar("User status updated successfully!", {
      variant: "success",
    });
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetchAdminUsers();
        if (res?.success) {
          const payload = res.data || [];
          const mapped = payload.map((u) => ({
            id: u.id,
            fullname: u.name,
            email: u.email,
            phone: u.phone,
            joinDate: u.joinDate ? new Date(u.joinDate).toLocaleDateString("en-IN") : "",
            orders: u.orders || 0,
            totalSpent: u.totalSpent || 0,
            lastLogin: u.lastUpdated
              ? new Date(u.lastUpdated).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            status: "Active", // no status field in backend; default Active
          }));
          setUsers(mapped);
        }
      } catch (err) {
        enqueueSnackbar(err.message || "Failed to load users", { variant: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [enqueueSnackbar]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesText =
        searchText.trim().length === 0 ||
        (user.fullname || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (user.phone || "").toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = statusFilter === "All" ? true : user.status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [users, searchText, statusFilter]);

  const activeUsers = filteredUsers.length; // filtered active view
  const totalOrders = useMemo(() => filteredUsers.reduce((sum, user) => sum + (user.orders || 0), 0), [filteredUsers]);
  const totalRevenue = useMemo(
    () => filteredUsers.reduce((sum, user) => sum + Number(user.totalSpent || 0), 0),
    [filteredUsers]
  );

  const handleExportPDF = () => {
    const printable = filteredUsers;
    const newWindow = window.open("", "_blank");
    if (!newWindow) return;

    const rows = printable
      .map(
        (user) => `
        <tr>
          <td>${user.fullname || ""}</td>
          <td>${user.email || ""}<br/>${user.phone || ""}</td>
          <td>${user.joinDate || ""}</td>
          <td>${user.orders || 0}</td>
          <td>₹${Number(user.totalSpent || 0).toLocaleString()}</td>
          <td>${user.status}</td>
        </tr>
      `
      )
      .join("");

    newWindow.document.write(`
      <html>
        <head>
          <title>Users Export</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
            h2 { margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; vertical-align: top; }
            th { background: #f3f4f6; }
            .summary { margin-bottom: 16px; font-size: 13px; }
          </style>
        </head>
        <body>
          <h2>Users Report</h2>
          <div class="summary">
            Total Users: ${printable.length} | Revenue: ₹${totalRevenue.toLocaleString()} | Orders: ${totalOrders}
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Join Date</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  return (
    <div className="view-users-container">
      <div className="add-product-header">
        <div className="add-product-icon">
          <Users size={40} strokeWidth={1.8} />
        </div>
        <h1 className="add-product-title">View Users</h1>
        <p className="add-product-subtitle">
        Manage your customer accounts and profiles efficiently.
        </p>
      </div>

      {/* User Stats */}
      <div className="view-users-stats-grid">
        <div className="view-users-stat-card">
          <div className="view-users-stat-content">
          <div className="view-orders-stat-icon">
            <Users size={26} className="view-orders-stat-icon-icon"/>
            </div>
            <div className="view-users-stat-info">
              <h3>{users.length}</h3>
              <p>Total Users</p>
            </div>
          </div>
        </div>

        <div className="view-users-stat-card">
          <div className="view-users-stat-content">
          <div className="view-orders-stat-icon">
            <UserCheck size={26} className="view-orders-stat-icon-icon"/>
            </div>
            <div className="view-users-stat-info">
              <h3>{activeUsers}</h3>
              <p>Active Users</p>
            </div>
          </div>
        </div>

        <div className="view-users-stat-card">
          <div className="view-users-stat-content">
          <div className="view-orders-stat-icon">
            <ShoppingCart size={26} className="view-orders-stat-icon-icon"/>
            </div>
            <div className="view-users-stat-info">
              <h3>{totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>
        </div>

        <div className="view-users-stat-card">
          <div className="view-users-stat-content">
          <div className="view-orders-stat-icon">
            <IndianRupee size={26} className="view-orders-stat-icon-icon" />
            </div>
            <div className="view-users-stat-info">
              <h3>₹{totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="view-users-table-container">
        <div className="view-users-table-header">
          <h3 className="view-users-table-title">Registered Users</h3>
          <div className="view-users-table-actions">
            <input
              className="view-orders-search"
              placeholder="Search name, email, phone"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
        
            <button className="view-users-secondary-btn d-flex align-items-center justify-content-center" onClick={handleExportPDF}>
              <Download size={14} style={{ marginRight: "6px" }} /> Export PDF
            </button>
          </div>
        </div>

        <div className="view-users-table-responsive">
          <table className="view-users-data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Join Date</th>
                <th>Orders</th>
                <th>Total Spent</th>
          
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="view-users-user-info">
                      
                      <div>
                        <div className="view-users-user-name">
                          {user.fullname}
                        </div>
                        <div className="view-users-user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="view-users-contact-info">
                      <div>{user.phone}</div>
                    </div>
                  </td>

                  <td>{user.joinDate}</td>

                  <td>
                    <span className="view-users-order-count">
                      {user.orders} orders
                    </span>
                  </td>

                  <td>
                    <strong className="view-users-total-spent">
                      ₹{Number(user.totalSpent || 0).toLocaleString()}
                    </strong>
                  </td>

                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="view-users-empty-state">
            <p className="view-users-empty-text">No users found</p>
          </div>
        )}
        {loading && (
          <div className="view-users-empty-state">
            <p className="view-users-empty-text">Loading users...</p>
          </div>
        )}
      </div>
    </div>
  );
}
