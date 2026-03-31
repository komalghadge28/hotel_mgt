import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <div className="dashboard-wrapper">
      <style>{`
        :root {
          --primary: #4f46e5;
          --primary-hover: #4338ca;
          --bg-soft: #f8fafc;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --white: #ffffff;
        }

        /* Full Page Reset & Centering */
        .dashboard-wrapper {
          min-height: 100vh;
          width: 100vw;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: var(--bg-soft);
          background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
          background-size: 30px 30px; /* Subtle grid background */
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* Main Center Card */
        .dashboard-card {
          width: 90%;
          max-width: 900px;
          background: var(--white);
          padding: 50px 40px;
          border-radius: 24px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .header-content {
          margin-bottom: 40px;
        }

        .header-content h2 {
          font-size: 32px;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
          letter-spacing: -0.025em;
        }

        .header-content p {
          color: var(--text-muted);
          margin-top: 8px;
          font-size: 16px;
        }

        /* Grid Layout for Links */
        .nav-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          width: 100%;
        }

        .menu-item {
          text-decoration: none;
          padding: 30px 20px;
          background: var(--white);
          border: 1px solid #f1f5f9;
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .menu-item:hover {
          border-color: var(--primary);
          transform: translateY(-5px);
          box-shadow: 0 12px 20px -10px rgba(79, 70, 229, 0.2);
        }

        /* Icon Placeholder Circle */
        .icon-box {
          width: 50px;
          height: 50px;
          background: #f0efff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          font-size: 20px;
          transition: 0.3s;
        }

        .menu-item:hover .icon-box {
          background: var(--primary);
          color: white;
        }

        .menu-text {
          font-weight: 700;
          font-size: 17px;
          color: var(--text-main);
        }

        .menu-desc {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 400;
        }

        /* Responsive Tweaks */
        @media (max-width: 640px) {
          .dashboard-card {
            padding: 30px 20px;
            width: 95%;
          }
          .nav-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="dashboard-card">
        <div className="header-content">
          <h2>Admin Control Center</h2>
          <p>Welcome back. What would you like to manage today?</p>
        </div>

        <nav className="nav-grid">
          <Link to="/admin/users" className="menu-item">
            <div className="icon-box">👥</div>
            <span className="menu-text">Manage Users</span>
            <span className="menu-desc">Add, edit or remove admin staff</span>
          </Link>

          <Link to="/admin/data" className="menu-item">
            <div className="icon-box">📄</div>
            <span className="menu-text">View Forms</span>
            <span className="menu-desc">Review submitted guest data</span>
          </Link>

          <Link to="/admin/work-report" className="menu-item">
            <div className="icon-box">📊</div>
            <span className="menu-text">Work Reports</span>
            <span className="menu-desc">Track employee daily progress</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

export default AdminDashboard;