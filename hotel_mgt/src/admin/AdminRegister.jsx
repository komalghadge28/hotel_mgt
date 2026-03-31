import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function AdminRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const registerAdmin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "admins", res.user.uid), {
        email,
        role: "admin",
        createdAt: new Date()
      });

      alert("Admin Registered Successfully ✅");
      navigate("/admin/login");

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="register-wrapper">
      <style>{`
        :root {
          --primary: #4f46e5;
          --primary-hover: #4338ca;
          --text-dark: #1e293b;
          --text-muted: #64748b;
          --bg-light: #f8fafc;
          --white: #ffffff;
        }

        .register-wrapper {
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
        }

        .register-card {
          width: 100%;
          max-width: 400px;
          background: var(--white);
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .register-header h2 {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-dark);
          margin: 0 0 10px 0;
          letter-spacing: -0.025em;
        }

        .register-header p {
          color: var(--text-muted);
          font-size: 15px;
          margin-bottom: 30px;
        }

        .input-group {
          text-align: left;
          margin-bottom: 20px;
          position: relative;
        }

        .input-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 8px;
          margin-left: 4px;
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
        }

        .eye-icon:hover {
          color: var(--primary);
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          margin-top: 10px;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          background: var(--primary);
          color: var(--white);
          transition: all 0.3s ease;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
        }

        .submit-btn:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.4);
        }

        .footer-text {
          margin-top: 20px;
          font-size: 14px;
          color: var(--text-muted);
        }

        .login-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 480px) {
          .register-card {
            padding: 30px 20px;
            width: 90%;
          }
        }
      `}</style>

      <div className="register-card">
        <div className="register-header">
          <h2>Create Account</h2>
          <p>Register a new administrative profile</p>
        </div>

        <div className="input-group">
          <label>Admin Email</label>
          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Set Password</label>
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

        <button className="submit-btn" onClick={registerAdmin}>Register Admin</button>
        
        <p className="footer-text">
          Already have an account?{" "}
          <span className="login-link" onClick={() => navigate("/admin/login")}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}

export default AdminRegister;