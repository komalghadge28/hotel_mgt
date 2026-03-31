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

  if (loading) return <div style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>Loading...</div>;
  if (!booking) return <div style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>Data not found.</div>;

  return (
    <div className="page-wrapper">
      <style>{`
        body { margin: 0; padding: 0; background-color: #0f172a; }

        .page-wrapper {
          display: flex;
          justify-content: center;
          width: 100vw;
          min-height: 100vh;
          background-color: #0f172a;
          font-family: 'Inter', sans-serif;
          padding: 40px 20px;
          box-sizing: border-box;
        }

        .container {
          width: 100%;
          max-width: 800px;
          background: #ffffff;
          border-radius: 16px;
          padding: 35px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          height: fit-content;
        }

        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f1f5f9;
        }

        h2 { font-size: 24px; color: #1e293b; margin: 0; font-weight: 800; }

        .btn-group { display: flex; gap: 10px; }

        button {
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-edit { background: #7c3aed; color: white; }
        .btn-save { background: #22c55e; color: white; }
        .btn-cancel { background: #f1f5f9; color: #6d28d9; }
        
        .btn-checkout { 
          width: 100%; 
          background: transparent; 
          border: 2px solid #7c3aed; 
          color: #7c3aed;
          margin-top: 20px;
          padding: 12px;
          font-weight: 700;
        }
        .btn-checkout:hover { background: #7c3aed; color: white; }

        .card { 
          border: 1px solid #ede9fe; 
          border-radius: 12px; 
          padding: 25px; 
          margin-bottom: 25px; 
          background: #fafafa; 
        }

        .guest-title { color: #7c3aed; margin-top: 0; margin-bottom: 20px; font-weight: 800; }

        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }

        .field { display: flex; flex-direction: column; }
        
        label { 
          font-size: 11px; 
          font-weight: 800; 
          color: #94a3b8; 
          text-transform: uppercase; 
          margin-bottom: 6px; 
        }

        /* VISIBILITY FIX: Dark text on white background */
        input {
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          font-size: 14px;
          color: #1e293b !important;
        }

        input:disabled { 
          background: #f8fafc; 
          color: #475569; 
          border-color: #f1f5f9; 
        }

        .docs-section { margin-top: 10px; }
        .docs-grid { display: flex; gap: 15px; margin-top: 10px; flex-wrap: wrap; }
        
        .doc-thumb { width: 110px; cursor: pointer; text-align: center; }
        .doc-thumb img { 
          width: 100%; 
          height: 100px; 
          object-fit: cover; 
          border-radius: 8px; 
          border: 2px solid #ede9fe; 
        }
        .doc-thumb span { 
          font-size: 10px; 
          font-weight: 700; 
          color: #7c3aed; 
          display: block; 
          margin-top: 6px; 
        }

        .overlay { 
          position: fixed; 
          inset: 0; 
          background: rgba(15, 23, 42, 0.9); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          z-index: 100; 
          backdrop-filter: blur(5px);
        }
        .overlay img { max-width: 90%; max-height: 80vh; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }

        @media (max-width: 600px) {
          .input-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="container">
        <div className="header-section">
          <h2>Verify Details</h2>
          <div className="btn-group">
            {editMode && <button className="btn-save" onClick={handleSave}>Save Changes</button>}
            <button className={editMode ? "btn-cancel" : "btn-edit"} onClick={() => setEditMode(!editMode)}>
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