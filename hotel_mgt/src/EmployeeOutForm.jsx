import { useState } from "react";
import { db } from "./firebase";
import axios from "axios";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function EmployeeOutForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    date: "",
    inTime: "",
    outTime: "",
    photo: null,
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  /* ==============================
      CLOUDINARY UPLOAD
  ============================== */
  const uploadPhoto = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "hotel_preset");

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/dvykretlt/image/upload`,
        formData
      );
      return res.data.secure_url;
    } catch (err) {
      console.error("❌ Upload failed:", err);
      return null;
    }
  };

  /* ==============================
      SUBMIT
  ============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.photo) {
      alert("Please fill in the name and select a photo.");
      return;
    }

    try {
      setLoading(true);
      const photoUrl = await uploadPhoto(form.photo);

      await addDoc(collection(db, "employeeOut"), {
        name: form.name,
        date: form.date,
        inTime: form.inTime,
        outTime: form.outTime,
        photoUrl,
        createdAt: serverTimestamp(),
      });

      alert("✅ Employee Out Saved Successfully");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to Submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-wrapper">
      <style>{`
        .employee-wrapper {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          box-sizing: border-box;
          font-family: 'Roboto', sans-serif;
        }

        .employee-card {
          width: 100%;
          max-width: 480px;
          background: #f9fafb;
          border-radius: 20px;
          padding: 35px 25px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          transition: transform 0.2s ease;
        }
        .employee-card:hover { transform: translateY(-4px); }

        .back-btn {
          background: transparent;
          border: none;
          color: #6b5b95;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 20px;
        }
        .back-btn:hover { text-decoration: underline; }

        .header-area { text-align: center; margin-bottom: 25px; }
        .header-area h2 { font-size: 1.8rem; color: #333; margin: 0; font-weight: 800; }
        .header-area p { color: #6b5b95; font-size: 0.95rem; margin-top: 6px; font-weight: 500; }

        .form-group { margin-bottom: 18px; display: flex; flex-direction: column; }
        .form-group label {
          font-size: 12px;
          font-weight: 700;
          color: #4b5563;
          margin-bottom: 5px;
        }
        .input-style {
          width: 100%;
          padding: 11px 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 14px;
          color: #1f2937;
          background: #ffffff;
        }
        .input-style:focus {
          outline: none;
          border-color: #6b5b95;
          box-shadow: 0 0 0 3px rgba(107, 91, 149, 0.1);
        }

        .time-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .submit-btn {
          width: 100%;
          padding: 15px;
          background: #6b5b95;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          margin-top: 10px;
          transition: 0.2s ease;
        }
        .submit-btn:hover { background: #594881; }
        .submit-btn:disabled { background: #b9aedf; cursor: not-allowed; }

        input[type="file"] {
          padding: 10px;
          border-radius: 8px;
          border: 1px dashed #cbd5e1;
          background: #f3f4f6;
        }

        @media (max-width: 500px) {
          .employee-card { padding: 25px 20px; border-radius: 16px; }
          .header-area h2 { font-size: 1.5rem; }
          .header-area p { font-size: 0.85rem; }
        }
      `}</style>

      <div className="employee-card">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Dashboard
        </button>

        <div className="header-area">
          <h2>Employee Exit Log</h2>
          <p>Final Shift Clearance Record</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Employee Name</label>
            <input
              className="input-style"
              placeholder="Enter full name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              className="input-style"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              required
            />
          </div>

          <div className="time-grid">
            <div className="form-group">
              <label>In Time</label>
              <input
                type="time"
                className="input-style"
                value={form.inTime}
                onChange={(e) => handleChange("inTime", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Out Time</label>
              <input
                type="time"
                className="input-style"
                value={form.outTime}
                onChange={(e) => handleChange("outTime", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Verification Photo</label>
            <input
              type="file"
              className="input-style"
              accept="image/*"
              onChange={(e) => handleChange("photo", e.target.files[0])}
              required
            />
          </div>

          <button className="submit-btn" disabled={loading}>
            {loading ? "Processing..." : "Submit Log"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmployeeOutForm;