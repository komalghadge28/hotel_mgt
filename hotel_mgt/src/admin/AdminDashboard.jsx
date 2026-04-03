import React from "react";
import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <div className="wrapper">
      <div className="card">
        
        <div className="header">
          <h1>Admin Control Center</h1>
          <p>
            Welcome back. Manage your users, data, and reports from one central workspace.
          </p>
        </div>

        <div className="grid">
          <Link to="/admin/users" className="box">
            <div className="icon">👥</div>
            <h3>Manage Users</h3>
            <p>Add, edit, or remove admin staff</p>
          </Link>

          <Link to="/admin/data" className="box">
            <div className="icon">📄</div>
            <h3>View Forms</h3>
            <p>Review submitted guest data</p>
          </Link>

          <Link to="/admin/work-report" className="box">
            <div className="icon">📊</div>
            <h3>Work Reports</h3>
            <p>Track employee progress</p>
          </Link>
        </div>

      </div>

      {/* CSS */}
      <style>{`
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #f1f5f9;
        }

        .wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .card {
          width: 100%;
          max-width: 900px;
          background: white;
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
        }

        .header h1 {
          margin: 0;
          font-size: 28px;
          color: #1e293b;
        }

        .header p {
          color: #64748b;
          margin-top: 10px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .box {
          text-decoration: none;
          background: #f8fafc;
          padding: 20px;
          border-radius: 15px;
          text-align: center;
          transition: 0.3s;
          border: 1px solid #e2e8f0;
        }

        .box:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .icon {
          font-size: 30px;
          margin-bottom: 10px;
        }

        .box h3 {
          margin: 5px 0;
          color: #1e293b;
        }

        .box p {
          font-size: 14px;
          color: #64748b;
        }

        /* MOBILE FIX */
        @media (max-width: 600px) {
          .card {
            padding: 20px;
          }

          .header h1 {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;