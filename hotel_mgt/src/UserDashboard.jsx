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
        /* Wrapper */
        .dashboard-wrapper {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 40px 15px;
          box-sizing: border-box;
          color: #f1f5f9;
        }

        .dashboard-container {
          width: 100%;
          max-width: 1100px;
          text-align: center;
        }

        /* Header */
        .welcome-header {
          margin-bottom: 40px;
          animation: fadeInDown 0.6s ease-out;
        }

        .welcome-header h1 {
          font-size: 3rem;
          font-weight: 900;
          letter-spacing: -1px;
          background: linear-gradient(to right, #ffe259, #ffa751, #ff6f61);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 20px;
        }

        .logout-pill {
          background: #fff;
          color: #764ba2;
          border: none;
          padding: 12px 28px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .logout-pill:hover {
          background: #764ba2;
          color: white;
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        /* Menu Grid */
        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 25px;
        }

        .menu-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          padding: 45px 25px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .menu-card:hover {
          transform: translateY(-10px);
          background: rgba(255,255,255,0.15);
          border-color: #ffe259;
          box-shadow: 0 20px 50px rgba(0,0,0,0.4);
        }

        .icon-box {
          font-size: 50px;
          margin-bottom: 20px;
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 24px;
          background: rgba(255,255,255,0.1);
          box-shadow: inset 0 0 12px rgba(255,255,255,0.1);
          transition: all 0.3s ease;
        }

        .menu-card:hover .icon-box {
          background: #ffe259;
          color: #764ba2;
          transform: scale(1.15) rotate(-5deg);
        }

        .menu-card h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #f1f5f9;
        }

        .menu-card p {
          font-size: 0.9rem;
          color: #d1d5db;
          margin-top: 10px;
          line-height: 1.5;
        }

        /* Animations */
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .welcome-header h1 { font-size: 2.2rem; }
          .menu-card { padding: 35px 20px; }
          .menu-grid { gap: 20px; }
        }

        @media (max-width: 480px) {
          .welcome-header { margin-bottom: 30px; }
          .menu-card { padding: 30px 15px; }
          .icon-box { width: 80px; height: 80px; font-size: 40px; }
          .menu-card h3 { font-size: 1.3rem; }
          .menu-card p { font-size: 0.85rem; }
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
          <div className="menu-card" onClick={() => navigate("/room-booking")}>
            <div className="icon-box">🔑</div>
            <h3>Room Booking</h3>
            <p>Register guests, assign rooms, and collect documents efficiently.</p>
          </div>

          <div className="menu-card" onClick={() => navigate("/verify-edit")}>
            <div className="icon-box">🛡️</div>
            <h3>Verify / Edit</h3>
            <p>Access booking records to update guest details or stay duration.</p>
          </div>

          <div className="menu-card" onClick={() => navigate("/employee-out")}>
            <div className="icon-box">🚪</div>
            <h3>Final Day Out</h3>
            <p>Complete employee exit logs and generate admin clearance records.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;