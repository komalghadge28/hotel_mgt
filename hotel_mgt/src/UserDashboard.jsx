import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";

function UserDashboard() {
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) navigate("/");
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  return (
    <div className="dashboard-wrapper">
      <style>{`
        .dashboard-wrapper {
          min-height: 100vh;
          width: 100vw;
          background: radial-gradient(circle at top left, #1e293b, #0f172a);
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 20px;
          box-sizing: border-box;
          color: #f8fafc;
        }

        .dashboard-container {
          width: 100%;
          max-width: 1000px;
          text-align: center;
        }

        .welcome-header {
          margin-bottom: 50px;
          animation: fadeInDown 0.6s ease-out;
        }

        .welcome-header h1 {
          font-size: 3rem;
          font-weight: 800;
          letter-spacing: -1px;
          background: linear-gradient(to right, #00b894, #00cec9, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 20px;
        }

        .logout-pill {
          background: rgba(214, 48, 49, 0.1);
          color: #ff7675;
          border: 1px solid #d63031;
          padding: 10px 24px;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: 0.3s;
        }

        .logout-pill:hover {
          background: #d63031;
          color: white;
          box-shadow: 0 0 25px rgba(214, 48, 49, 0.4);
          transform: scale(1.05);
        }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-top: 20px;
        }

        .menu-card {
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 50px 30px;
          border-radius: 28px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .menu-card:hover {
          transform: translateY(-12px);
          background: rgba(51, 65, 85, 0.9);
          border-color: #3b82f6;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }

        .icon-box {
          font-size: 45px;
          margin-bottom: 25px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05));
          width: 90px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 24px;
          box-shadow: inset 0 0 10px rgba(255,255,255,0.05);
        }

        .menu-card:hover .icon-box {
          background: #3b82f6;
          color: white;
          transform: scale(1.1) rotate(-5deg);
        }

        .menu-card h3 {
          margin: 0;
          font-size: 1.6rem;
          font-weight: 700;
          color: #f1f5f9;
        }

        .menu-card p {
          font-size: 0.95rem;
          color: #94a3b8;
          margin-top: 12px;
          line-height: 1.5;
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .welcome-header h1 { font-size: 2.2rem; }
          .menu-grid { grid-template-columns: 1fr; }
          .menu-card { padding: 40px 20px; }
        }
      `}</style>

      <div className="dashboard-container">
        <header className="welcome-header">
          <h1>Hotel Management System</h1>
          <button className="logout-pill" onClick={handleLogout}>
            Logout Securely
          </button>
        </header>

        <div className="menu-grid">
          {/* ROOM BOOKING */}
          <div className="menu-card" onClick={() => navigate("/room-booking")}>
            <div className="icon-box">🔑</div>
            <h3>Room Booking</h3>
            <p>Initiate new guest registrations, assign rooms, and collect documentation.</p>
          </div>

          {/* VERIFY / EDIT */}
          <div className="menu-card" onClick={() => navigate("/verify-edit")}>
            <div className="icon-box">🛡️</div>
            <h3>Verify / Edit</h3>
            <p>Access active booking records to update guest details or modify stay duration.</p>
          </div>

          {/* EMPLOYEE FINAL OUT */}
          <div className="menu-card" onClick={() => navigate("/employee-out")}>
            <div className="icon-box">🚪</div>
            <h3>Final Day Out</h3>
            <p>Finalize employee departures and generate complete administrative exit logs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;