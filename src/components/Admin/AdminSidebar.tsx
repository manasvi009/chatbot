import React from 'react';
import './AdminSidebar.css';

const AdminSidebar: React.FC = () => {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <a href="/admin/dashboard">Dashboard</a>
          </li>
          <li>
            <a href="/admin/tickets">Ticket Management</a>
          </li>
          <li>
            <a href="/admin/faqs">FAQ Management</a>
          </li>
          <li>
            <a href="/admin/users">User Management</a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;