import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) return alert("Please fill all fields");
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login Success ✅");
      navigate("/dashboard");
    } catch (error) {
      alert("Login Failed: Check your credentials");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <style>{`
        :root {
          --primary: #4f46e5;
          --primary-hover: #4338ca;
          --text-dark: #1e293b;
          --text-muted: #64748b;
          --bg-light: #f8fafc;
          --white: #ffffff;
        }

        .login-wrapper {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: var(--bg-light);
          background-image: 
            radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
            radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
            radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          margin: 0;
          position: absolute;
          left: 0;
          top: 0;
          padding: 20px;
          box-sizing: border-box;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: var(--white);
          padding: 40px;
          border-radius: 28px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hotel-logo {
          font-size: 44px;
          margin-bottom: 15px;
          display: inline-block;
        }

        .login-header h2 {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-dark);
          margin: 0 0 10px 0;
          letter-spacing: -0.025em;
        }

        .login-header p {
          color: var(--text-muted);
          font-size: 15px;
          margin-bottom: 35px;
        }

        .input-group {
          text-align: left;
          margin-bottom: 22px;
          position: relative;
        }

        .input-group label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 8px;
          margin-left: 4px;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .password-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          font-size: 15px;
          outline: none;
          background-color: #f1f5f9;
          color: var(--text-dark);
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        input:focus {
          border-color: var(--primary);
          background-color: var(--white);
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }

        .eye-icon {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          color: var(--text-muted);
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: auto;
          box-shadow: none;
          transition: color 0.2s;
        }

        .eye-icon:hover {
          color: var(--primary);
        }

        .login-btn {
          width: 100%;
          padding: 16px;
          margin-top: 10px;
          border: none;
          border-radius: 14px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          background: var(--primary);
          color: var(--white);
          transition: all 0.3s ease;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .login-btn:hover:not(:disabled) {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.4);
        }

        .login-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
        }

        .footer-text {
          margin-top: 30px;
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 40px 25px;
            width: 100%;
          }
          .login-header h2 { font-size: 24px; }
        }
      `}</style>

      <div className="login-card">
        <div className="hotel-logo">🏨</div>
        <div className="login-header">
          <h2>👤User Login</h2>
          <p>Secure access to hotel management system</p>
        </div>

        <div className="input-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="name@hotel.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Security Password</label>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button" 
              className="eye-icon" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "👁️‍🗨️" : "👁️"} 
            </button>
          </div>
        </div>

        <button 
          className="login-btn" 
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Authenticating..." : "Sign In"}
        </button>

        <div className="footer-text">
          Authorized Access Only • Protected by Secure Encryption
        </div>
      </div>
    </div>
  );
}

export default Login;