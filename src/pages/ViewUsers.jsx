import { useState } from "react";
import { enqueueSnackbar } from "notistack";
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

export default function ViewUsers() {
  const [users, setUsers] = useState([
    {
      id: 1,
      fullname: "Rahul Mehta",
      email: "rahul@gmail.com",
      phone: "9876543210",
      joinDate: "2025-10-15",
      status: "Active",
      orders: 12,
      totalSpent: "₹24,999",
      lastLogin: "2025-11-11 14:30",
    },
    {
      id: 2,
      fullname: "Neha Shah",
      email: "neha@gmail.com",
      phone: "9822334455",
      joinDate: "2025-10-20",
      status: "Active",
      orders: 8,
      totalSpent: "₹15,999",
      lastLogin: "2025-11-11 10:15",
    },
    {
      id: 3,
      fullname: "Aarav Patel",
      email: "aarav@gmail.com",
      phone: "9765432109",
      joinDate: "2025-09-05",
      status: "Inactive",
      orders: 3,
      totalSpent: "₹5,499",
      lastLogin: "2025-10-28 16:45",
    },
    {
      id: 4,
      fullname: "Sneha Reddy",
      email: "sneha@gmail.com",
      phone: "9988776655",
      joinDate: "2025-11-01",
      status: "Active",
      orders: 5,
      totalSpent: "₹8,999",
      lastLogin: "2025-11-11 18:20",
    },
  ]);

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

  const activeUsers = users.filter((user) => user.status === "Active").length;
  const totalOrders = users.reduce((sum, user) => sum + user.orders, 0);

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
              <h3>₹55,496</h3>
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
            <button className="view-users-secondary-btn">
              <Download size={14} style={{ marginRight: "6px" }} /> Export
            </button>
            <button className="view-users-secondary-btn">
              <Search size={14} style={{ marginRight: "6px" }} /> Search
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
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="view-users-user-info">
                      <div className="view-users-user-avatar">
                        {user.fullname.charAt(0)}
                      </div>
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
                      {user.totalSpent}
                    </strong>
                  </td>

                  

                  <td>
                    <span
                      className={`view-users-status-badge ${
                        user.status === "Active"
                          ? "view-users-status-active"
                          : "view-users-status-inactive"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td>
                    <div className="view-users-action-buttons">
                      <button
                        className={`view-users-btn-toggle ${
                          user.status === "Active"
                            ? "view-users-btn-danger"
                            : "view-users-btn-success"
                        }`}
                        onClick={() => handleStatusToggle(user.id)}
                      >
                        {user.status === "Active" ? (
                          <>
                            <UserX size={14} /> Deactivate
                          </>
                        ) : (
                          <>
                            <UserPlus size={14} /> Activate
                          </>
                        )}
                      </button>
                    </div>
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
      </div>
    </div>
  );
}
