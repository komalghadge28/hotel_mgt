import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

function VerifyEdit() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const ref = doc(db, "bookings", bookingId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setBooking(snap.data());
        } else {
          alert("Booking not found");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const handleChange = (idx, field, value) => {
    const updated = [...booking.entries];
    updated[idx][field] = value;
    setBooking({ ...booking, entries: updated });
  };

  const handleArrivalChange = (idx, field, value) => {
    const updated = [...booking.entries];
    updated[idx].arrival[field] = value;
    setBooking({ ...booking, entries: updated });
  };

  const handlePhoneChange = (idx, value) => {
    const updated = [...booking.entries];
    updated[idx].phones = value.split(",").map((p) => p.trim());
    setBooking({ ...booking, entries: updated });
  };

  const handleSave = async () => {
    try {
      const ref = doc(db, "bookings", bookingId);
      await updateDoc(ref, {
        entries: booking.entries,
        updatedAt: serverTimestamp(),
      });
      alert("✅ Saved Successfully");
      setEditMode(false);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  if (loading)
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
        Loading...
      </div>
    );
  if (!booking)
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
        Data not found.
      </div>
    );

  return (
    <div className="page-wrapper">
      <style>{`
        body { margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', sans-serif; }

        .page-wrapper {
          display: flex;
          justify-content: center;
          width: 100vw;
          min-height: 100vh;
          background-color: #0f172a;
          padding: 20px;
          box-sizing: border-box;
        }

        .container {
          width: 100%;
          max-width: 800px;
          background: #fff;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 10px;
        }

        h2 { color: #2c3e50; margin: 0; font-weight: 700; font-size: 22px; }
        .btn-group { display: flex; gap: 10px; }

        button {
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: 0.2s;
        }
        .btn-edit { background: #4a90e2; color: white; }
        .btn-save { background: #22c55e; color: white; }
        .btn-cancel { background: #f0f2f5; color: #4b5563; border: 1px solid #d1d5db; }
        .btn-checkout {
          width: 100%;
          background: transparent;
          border: 2px solid #4a90e2;
          color: #4a90e2;
          margin-top: 15px;
          padding: 12px;
          font-weight: 700;
        }
        .btn-checkout:hover { background: #4a90e2; color: white; }

        .card { 
          border: 1px solid #edf2f7; 
          border-radius: 12px; 
          padding: 20px; 
          margin-bottom: 20px; 
          background: #fdfdfd;
        }

        .guest-title { color: #4a90e2; margin-top: 0; margin-bottom: 15px; font-weight: 700; }

        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .field { display: flex; flex-direction: column; }
        label { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 5px; }

        input {
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #fff;
          font-size: 14px;
          color: #1e293b !important;
        }
        input:disabled { background: #f1f5f9; color: #6b7280; border-color: #e2e8f0; }

        .docs-section { margin-top: 10px; }
        .docs-grid { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
        .doc-thumb { width: 90px; cursor: pointer; text-align: center; }
        .doc-thumb img { width: 100%; height: 80px; object-fit: cover; border-radius: 6px; border: 2px solid #e5e7eb; }
        .doc-thumb span { font-size: 10px; font-weight: 600; color: #4a90e2; display: block; margin-top: 5px; }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
          backdrop-filter: blur(4px);
        }
        .overlay img { max-width: 90%; max-height: 80vh; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }

        @media (max-width: 600px) {
          .input-grid { grid-template-columns: 1fr; }
          .container { padding: 20px; border-radius: 0; }
        }
      `}</style>

      <div className="container">
        <div className="header-section">
          <h2>Verify Details</h2>
          <div className="btn-group">
            {editMode && <button className="btn-save" onClick={handleSave}>Save Changes</button>}
            <button
              className={editMode ? "btn-cancel" : "btn-edit"}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Cancel" : "Edit Details"}
            </button>
          </div>
        </div>

        {booking.entries.map((entry, idx) => (
          <div className="card" key={idx}>
            <h3 className="guest-title">Guest #{idx + 1}</h3>

            <div className="input-grid">
              <div className="field">
                <label>Full Name</label>
                <input disabled={!editMode} value={entry.name} onChange={(e) => handleChange(idx, "name", e.target.value)} />
              </div>
              <div className="field">
                <label>Age</label>
                <input disabled={!editMode} value={entry.age} onChange={(e) => handleChange(idx, "age", e.target.value)} />
              </div>
            </div>

            <div className="input-grid">
              <div className="field">
                <label>Phone Numbers (Comma Separated)</label>
                <input disabled={!editMode} value={entry.phones.join(", ")} onChange={(e) => handlePhoneChange(idx, e.target.value)} />
              </div>
              <div className="field">
                <label>Nationality</label>
                <input disabled={!editMode} value={entry.arrival.nationality} onChange={(e) => handleArrivalChange(idx, "nationality", e.target.value)} />
              </div>
            </div>

            <div className="docs-section">
              <label>Verification Documents</label>
              <div className="docs-grid">
                {Object.entries(entry)
                  .filter(([key, val]) => ["aadharFront", "aadharBack", "pan", "license", "passport", "photo"].includes(key) && val)
                  .map(([key, val]) => (
                    <div className="doc-thumb" key={key} onClick={() => setPreview(val)}>
                      <img src={val} alt={key} />
                      <span>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                    </div>
                  ))}
              </div>
            </div>

            <button className="btn-checkout" onClick={() => navigate(`/out-form/${bookingId}/${idx}`)}>
              Proceed to Check-out
            </button>
          </div>
        ))}

        {preview && (
          <div className="overlay" onClick={() => setPreview(null)}>
            <img src={preview} alt="preview" />
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEdit;