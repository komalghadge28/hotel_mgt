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
    formData.append("upload_preset", "hotel_preset"); // Ensure this matches your MultiStepForm preset

    try {
      // Switched to direct Cloudinary upload to match your working MultiStepForm logic
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
        body { margin: 0; padding: 0; background-color: #0f172a; }

        .employee-wrapper {
          min-height: 100vh;
          width: 100vw;
          background: #0f172a;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }

        .employee-card {
          width: 100%;
          max-width: 500px;
          background: #ffffff;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .back-btn {
          background: transparent;
          border: 1px solid #ddd6fe;
          color: #7c3aed;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 25px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: 0.2s;
        }

        .back-btn:hover { background: #f5f3ff; border-color: #7c3aed; }

        .header-area { text-align: center; margin-bottom: 30px; }
        .header-area h2 { font-size: 1.6rem; color: #1e293b; margin: 0; font-weight: 800; }
        .header-area p { color: #7c3aed; font-size: 0.9rem; margin-top: 5px; font-weight: 600; }

        .form-group { margin-bottom: 20px; display: flex; flex-direction: column; }
        .form-group label {
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .input-style {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          font-size: 14px;
          color: #1e293b !important; /* Critical Fix for Visibility */
          box-sizing: border-box;
        }

        .input-style:focus {
          outline: none;
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        .submit-btn {
          width: 100%;
          padding: 16px;
          background: #7c3aed;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: 0.2s;
          margin-top: 10px;
        }

        .submit-btn:hover { background: #6d28d9; }
        .submit-btn:disabled { background: #c4b5fd; cursor: not-allowed; }

        input[type="file"] {
          padding: 10px;
          background: #fafafa;
          border: 1px dashed #ddd6fe;
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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