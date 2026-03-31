import { useState } from "react";
import axios from "axios";
import { db, auth } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

function MultiStepForm() {
  const navigate = useNavigate();

  const CLOUD_NAME = "dvykretlt";
  const UPLOAD_PRESET = "hotel_preset";

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [days, setDays] = useState([
    { day: 1, guests: [{ name: "", age: "", email: "", gender: "", phones: [""] }] },
  ]);

  const [arrival, setArrival] = useState({
    nationality: "",
    arrivalDate: "",
    arrivalTime: "",
    location: "",
  });

  const [stay, setStay] = useState({
    stayType: "",
    roomNo: "",
    days: 1,
  });

  const [documents, setDocuments] = useState({
    aadharFront: null,
    aadharBack: null,
    pan: null,
    license: null,
    passport: null,
    photo: null,
  });

  const [crop, setCrop] = useState({
    unit: "%",
    x: 10,
    y: 10,
    width: 80,
    height: 80,
    aspect: 1,
  });

  const [cropSrc, setCropSrc] = useState(null);
  const [currentField, setCurrentField] = useState(null);
  const [preview, setPreview] = useState(null);

  /* ---------------- LOGIC ---------------- */

  const handleGuestChange = (dayIdx, guestIdx, field, value) => {
    const updated = [...days];
    updated[dayIdx].guests[guestIdx][field] = value;
    setDays(updated);
  };

  const handlePhoneChange = (dayIdx, guestIdx, phoneIdx, value) => {
    const updated = [...days];
    updated[dayIdx].guests[guestIdx].phones[phoneIdx] = value;
    setDays(updated);
  };

  const addGuest = (dayIdx) => {
    const updated = [...days];
    updated[dayIdx].guests.push({ name: "", age: "", email: "", gender: "", phones: [""] });
    setDays(updated);
  };

  const removeGuest = (dayIdx, guestIdx) => {
    const updated = [...days];
    updated[dayIdx].guests.splice(guestIdx, 1);
    setDays(updated);
  };

  const addPhone = (dayIdx, guestIdx) => {
    const updated = [...days];
    updated[dayIdx].guests[guestIdx].phones.push("");
    setDays(updated);
  };

  const removePhone = (dayIdx, guestIdx, phoneIdx) => {
    const updated = [...days];
    updated[dayIdx].guests[guestIdx].phones.splice(phoneIdx, 1);
    setDays(updated);
  };

  const addDay = () => {
    const nextDay = days.length + 1;
    setDays([...days, { day: nextDay, guests: [{ name: "", age: "", email: "", gender: "", phones: [""] }] }]);
  };

  const removeDay = (dayIdx) => {
    const updated = [...days];
    updated.splice(dayIdx, 1);
    setDays(updated);
  };

  const handleFileSelect = (file, field) => {
    if (!file) return;
    setCurrentField(field);
    setCropSrc(URL.createObjectURL(file));
  };

  const handleCropComplete = () => {
    if (!crop.width || !crop.height) return;
    const img = document.getElementById("crop-img");
    const canvas = document.createElement("canvas");
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      img,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    canvas.toBlob((blob) => {
      const file = new File([blob], `${currentField}.jpg`, { type: "image/jpeg" });
      setDocuments((prev) => ({ ...prev, [currentField]: file }));
      setCropSrc(null);
    }, "image/jpeg", 0.9);
  };

  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData);
      return res.data.secure_url;
    } catch (err) {
      console.error("Cloudinary Error:", err);
      return null;
    }
  };

  const submitForm = async () => {
    setLoading(true);
    setMessage("");
    try {
      const user = auth.currentUser;
      if (!user) { alert("Login first"); setLoading(false); return; }

      const urls = {};
      for (let key in documents) {
        if (documents[key]) {
          urls[key] = await uploadToCloudinary(documents[key]);
        }
      }

      const entries = [];
      days.forEach((d) => {
        d.guests.forEach((g, idx) => {
          entries.push({
            day: d.day,
            serial: idx + 1,
            ...g,
            arrival,
            stay,
            ...urls,
          });
        });
      });

      const docRef = await addDoc(collection(db, "bookings"), {
        userId: user.uid,
        entries,
        status: "active",
        createdAt: serverTimestamp(),
      });

      setMessage("✅ Booking Saved Successfully!");
      setTimeout(() => navigate(`/verify-edit/${docRef.id}`), 1500);
    } catch (err) {
      console.error(err);
      setMessage("❌ Submission Failed");
    }
    setLoading(false);
  };

  const hasFiles = Object.values(documents).some((f) => f !== null);

  return (
    <div className="page-wrapper">
      <style>{`
        :root {
          --primary: #6366f1;
          --primary-hover: #4f46e5;
          --bg: #f3f4f6;
          --card-bg: #ffffff;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --danger: #ef4444;
          --success: #10b981;
        }

        body { 
          margin: 0; 
          background-color: var(--bg); 
          color: var(--text-main); 
          font-family: 'Inter', system-ui, -apple-system, sans-serif; 
        }
        
        .page-wrapper { 
          display: flex; 
          flex-direction: column;
          align-items: center; 
          justify-content: flex-start;
          min-height: 100vh; 
          width: 100%;
          padding: 40px 20px; 
          box-sizing: border-box; 
        }
        
        .container { 
          width: 100%; 
          max-width: 800px; 
          background: var(--card-bg); 
          border-radius: 24px; 
          padding: 40px; 
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          box-sizing: border-box;
        }
        
        h2 { font-size: 32px; font-weight: 800; margin: 0 0 8px 0; color: var(--text-main); letter-spacing: -1px; text-align: center; }
        .subtitle { color: var(--text-muted); margin-bottom: 40px; font-size: 16px; text-align: center; }
        
        h3 { 
          font-size: 14px; 
          text-transform: uppercase; 
          letter-spacing: 1.5px; 
          color: var(--primary); 
          margin: 45px 0 20px; 
          font-weight: 700; 
          display: flex; 
          align-items: center; 
          gap: 15px; 
        }
        h3::after { content: ""; flex: 1; height: 1px; background: var(--border); }
        
        .card { border: 1px solid var(--border); border-radius: 16px; padding: 25px; margin-bottom: 20px; background: #fafafa; }
        
        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .field { display: flex; flex-direction: column; gap: 8px; }
        
        label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        
        input, select { 
          padding: 14px; 
          border: 1.5px solid var(--border); 
          border-radius: 12px; 
          font-size: 15px; 
          outline: none; 
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          background: #fff;
          color: #1e293b;
        }
        
        input:focus, select:focus { 
          border-color: var(--primary); 
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); 
        }

        .btn-primary { 
          background: var(--primary); 
          color: white; 
          padding: 16px; 
          border-radius: 14px; 
          border: none; 
          font-weight: 700; 
          cursor: pointer; 
          transition: 0.3s; 
          width: 100%; 
          font-size: 16px; 
          box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
        }
        .btn-primary:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3); }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary:disabled { background: #cbd5e1; cursor: not-allowed; transform: none; box-shadow: none; }

        .btn-secondary { background: #fff; color: var(--text-main); padding: 10px 18px; border-radius: 10px; border: 1px solid var(--border); font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }

        .docs-container { display: flex; flex-direction: column; gap: 12px; }
        .doc-row { 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          padding: 16px 20px; 
          border: 1px solid var(--border); 
          border-radius: 16px; 
          background: #fff;
          transition: 0.2s;
        }
        .doc-row:hover { border-color: var(--primary); background: #f5f3ff; }
        .doc-info { display: flex; align-items: center; gap: 15px; }
        .doc-dot { width: 10px; height: 10px; border-radius: 50%; background: #e2e8f0; border: 2px solid #fff; outline: 1px solid #cbd5e1; }
        .doc-dot.active { background: var(--success); outline-color: var(--success); }
        .doc-name { font-size: 15px; font-weight: 600; text-transform: capitalize; color: #334155; }
        .doc-btns { display: flex; gap: 10px; }
        
        .upload-icon-btn { 
          width: 42px; height: 42px; border-radius: 12px; border: 1px solid var(--border); 
          display: flex; align-items: center; justify-content: center; cursor: pointer; background: white; transition: 0.2s;
        }
        .upload-icon-btn:hover { border-color: var(--primary); color: var(--primary); transform: scale(1.05); }

        .modal { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-content { background: white; padding: 30px; border-radius: 24px; max-width: 500px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        
        .status-msg { padding: 18px; border-radius: 14px; margin-bottom: 30px; font-weight: 600; text-align: center; background: #f0fdf4; color: var(--success); border: 1px solid #bbf7d0; }

        @media (max-width: 768px) {
          .page-wrapper { padding: 0; }
          .container { border-radius: 0; padding: 25px; }
          .input-grid { grid-template-columns: 1fr; gap: 15px; }
          .doc-row { flex-direction: column; align-items: flex-start; gap: 15px; }
          .doc-btns { width: 100%; justify-content: flex-end; }
        }
      `}</style>

      <div className="container">
        <h2>Room Booking</h2>
        <p className="subtitle">Securely provide guest details and documents for verification.</p>
        
        {message && <div className="status-msg">{message}</div>}

        {days.map((d, dayIdx) => (
          <div key={dayIdx}>
            <h3>Day {d.day} Guests</h3>
            {d.guests.map((g, guestIdx) => (
              <div className="card" key={guestIdx}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                  <span style={{fontWeight:800, color: 'var(--text-muted)'}}>GUEST {guestIdx + 1}</span>
                  {d.guests.length > 1 && (
                    <button style={{color:'var(--danger)', border:'none', background:'none', cursor:'pointer', fontWeight:600}} onClick={() => removeGuest(dayIdx, guestIdx)}>Remove</button>
                  )}
                </div>

                <div className="input-grid">
                  <div className="field">
                    <label>Full Name</label>
                    <input placeholder="Enter full name" value={g.name} onChange={(e) => handleGuestChange(dayIdx, guestIdx, "name", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Age</label>
                    <input type="number" placeholder="Years" value={g.age} onChange={(e) => handleGuestChange(dayIdx, guestIdx, "age", e.target.value)} />
                  </div>
                </div>

                <div className="input-grid">
                  <div className="field">
                    <label>Email Address</label>
                    <input type="email" placeholder="example@mail.com" value={g.email} onChange={(e) => handleGuestChange(dayIdx, guestIdx, "email", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Gender</label>
                    <select value={g.gender} onChange={(e) => handleGuestChange(dayIdx, guestIdx, "gender", e.target.value)}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <label style={{display: 'block', marginBottom: '10px'}}>Contact Information</label>
                {g.phones.map((ph, phoneIdx) => (
                  <div key={phoneIdx} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <input style={{flex:1}} placeholder="Phone Number" value={ph} onChange={(e) => handlePhoneChange(dayIdx, guestIdx, phoneIdx, e.target.value)} />
                    {g.phones.length > 1 && (
                      <button type="button" style={{color: 'var(--danger)', background: '#fff', border: '1px solid #fee2e2', padding: '0 15px', borderRadius: '12px', cursor: 'pointer'}} onClick={() => removePhone(dayIdx, guestIdx, phoneIdx)}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-secondary" onClick={() => addPhone(dayIdx, guestIdx)}>+ Add Secondary Phone</button>
              </div>
            ))}

            <div style={{display: 'flex', gap: '15px', marginBottom: '40px'}}>
              <button type="button" className="btn-secondary" style={{flex: 1, padding: '12px'}} onClick={() => addGuest(dayIdx)}>+ Add Another Guest</button>
              {days.length > 1 && (
                <button type="button" style={{color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600}} onClick={() => removeDay(dayIdx)}>Delete Day {d.day}</button>
              )}
            </div>
          </div>
        ))}
        
        <button type="button" className="btn-secondary" style={{width: '100%', border: '2px dashed var(--border)', background: 'transparent', padding: '20px', fontSize: '15px'}} onClick={addDay}>
          + Schedule for Another Day
        </button>

        <h3>Stay Information</h3>
        <div className="input-grid">
          <div className="field">
            <label>Check-in Date</label>
            <input type="date" value={arrival.arrivalDate} onChange={(e) => setArrival({ ...arrival, arrivalDate: e.target.value })} />
          </div>
          <div className="field">
            <label>Check-in Time</label>
            <input type="time" value={arrival.arrivalTime} onChange={(e) => setArrival({ ...arrival, arrivalTime: e.target.value })} />
          </div>
        </div>
        <div className="input-grid">
          <div className="field">
            <label>Nationality</label>
            <input placeholder="e.g. Indian" value={arrival.nationality} onChange={(e) => setArrival({ ...arrival, nationality: e.target.value })} />
          </div>
          <div className="field">
            <label>Traveling From</label>
            <input placeholder="City Name" value={arrival.location} onChange={(e) => setArrival({ ...arrival, location: e.target.value })} />
          </div>
        </div>

        <div className="input-grid" style={{gridTemplateColumns: '2fr 1fr 1fr'}}>
          <div className="field">
            <label>Room Category</label>
            <input placeholder="Standard/Deluxe/Suite" value={stay.stayType} onChange={(e) => setStay({ ...stay, stayType: e.target.value })} />
          </div>
          <div className="field">
            <label>Room No</label>
            <input placeholder="Ex. 204" value={stay.roomNo} onChange={(e) => setStay({ ...stay, roomNo: e.target.value })} />
          </div>
          <div className="field">
            <label>Stay Days</label>
            <input type="number" value={stay.days} onChange={(e) => setStay({ ...stay, days: e.target.value })} />
          </div>
        </div>

        <h3>KYC Verification</h3>
        <div className="docs-container">
          {Object.keys(documents).map((field) => (
            <div key={field} className="doc-row">
              <div className="doc-info">
                <div className={`doc-dot ${documents[field] ? 'active' : ''}`}></div>
                <span className="doc-name">{field.replace(/([A-Z])/g, ' $1')}</span>
              </div>
              
              <div className="doc-btns">
                {documents[field] && (
                  <button type="button" className="btn-secondary" style={{padding: '8px 12px'}} onClick={() => setPreview(URL.createObjectURL(documents[field]))}>👁 Preview</button>
                )}
                <button type="button" className="upload-icon-btn" onClick={() => document.getElementById(`file-${field}`).click()}>📷</button>
                <button type="button" className="upload-icon-btn" onClick={() => document.getElementById(`file-${field}`).click()}>📁</button>
                <input type="file" accept="image/*" capture="environment" id={`file-${field}`} style={{display: 'none'}} onChange={(e) => handleFileSelect(e.target.files[0], field)} />
              </div>
            </div>
          ))}
        </div>

        <button 
          className="btn-primary" 
          style={{marginTop: '50px'}} 
          onClick={submitForm} 
          disabled={!hasFiles || loading}
        >
          {loading ? "Processing..." : "Confirm & Save Booking"}
        </button>
      </div>

      {cropSrc && (
        <div className="modal">
          <div className="modal-content">
            <h4 style={{marginTop: 0, marginBottom: '20px', fontSize: '18px'}}>Finalize Document Crop</h4>
            <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
              <img id="crop-img" src={cropSrc} alt="crop" style={{maxWidth: '100%', borderRadius: '12px'}} />
            </ReactCrop>
            <div style={{display: 'flex', gap: '15px', marginTop: '25px'}}>
              <button type="button" className="btn-secondary" style={{flex: 1}} onClick={() => setCropSrc(null)}>Cancel</button>
              <button type="button" className="btn-primary" style={{flex: 2, padding: '12px'}} onClick={handleCropComplete}>Save Image</button>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div className="modal" onClick={() => setPreview(null)}>
          <div style={{position: 'relative', maxWidth: '85%'}}>
             <img src={preview} style={{width: '100%', borderRadius: '20px', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)'}} alt="preview" />
             <div style={{color: 'white', position:'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)', fontWeight: 600, fontSize: '14px'}}>Click anywhere to close</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiStepForm;