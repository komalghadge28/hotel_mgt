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

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [persons, setPersons] = useState([
    { name: "", age: "", email: "", gender: "", phones: [""] },
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
    days: "",
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

  /* ---------------- HANDLERS ---------------- */

  const handlePersonChange = (idx, field, value) => {
    const updated = [...persons];
    updated[idx][field] = value;
    setPersons(updated);
  };

  const handlePhoneChange = (pIdx, phoneIdx, value) => {
    const updated = [...persons];
    updated[pIdx].phones[phoneIdx] = value;
    setPersons(updated);
  };

  const addPerson = () => {
    setPersons([...persons, { name: "", age: "", email: "", gender: "", phones: [""] }]);
  };

  const removePerson = (idx) => {
    setPersons(persons.filter((_, i) => i !== idx));
  };

  const addPhone = (pIdx) => {
    const updated = [...persons];
    updated[pIdx].phones.push("");
    setPersons(updated);
  };

  const removePhone = (pIdx, phoneIdx) => {
    const updated = [...persons];
    updated[pIdx].phones.splice(phoneIdx, 1);
    setPersons(updated);
  };

  const handleFileSelect = (file, field) => {
    if (!file) return;
    setCurrentField(field);
    setCropSrc(URL.createObjectURL(file));
  };

  // Logic to re-edit an already uploaded file
  const handleEdit = (field) => {
    const file = documents[field];
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
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      img,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    canvas.toBlob((blob) => {
      const file = new File([blob], `${currentField}.jpg`, { type: "image/jpeg" });
      setDocuments((prev) => ({ ...prev, [currentField]: file }));
      setCropSrc(null);
    });
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
      console.error("Cloudinary Upload Error:", err);
      return null;
    }
  };

  const submitForm = async () => {
    setLoading(true);
    setMessage("");
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please login first");
        setLoading(false);
        return;
      }

      const urls = {};
      for (let key in documents) {
        if (documents[key]) {
          urls[key] = await uploadToCloudinary(documents[key]);
        }
      }

      const docRef = await addDoc(collection(db, "bookings"), {
        userId: user.uid,
        entries: persons.map((p, i) => ({
          serial: i + 1,
          ...p,
          arrival,
          stay,
          ...urls,
        })),
        status: "active",
        createdAt: serverTimestamp(),
      });

      setMessage("✅ Booking Successful!");
      setTimeout(() => navigate(`/verify-edit/${docRef.id}`), 1500);
    } catch (err) {
      console.error("Firestore Submission Error:", err);
      setMessage("❌ Submission Failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="form-wrapper">
     <style>{`
/* ===== ROOT ===== */
.form-wrapper {
  background-color: #f4f7f9;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 10px;
  font-family: 'Segoe UI', sans-serif;
}

/* ===== MAIN CONTAINER ===== */
.container {
  background: #fff;
  width: 100%;
  max-width: 650px;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
}

/* ===== HEADINGS ===== */
h2 {
  color: #2c3e50;
  text-align: center;
  font-weight: 700;
  margin-bottom: 10px;
}

h3 {
  color: #34495e;
  border-bottom: 2px solid #f1f1f1;
  padding-bottom: 8px;
  margin-top: 25px;
  margin-bottom: 15px;
}

/* ===== CARD ===== */
.guest-card {
  background: #ffffff;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid #edf2f7;
}

/* ===== INPUTS ===== */
input, select {
  width: 100%;
  padding: 12px;
  margin: 6px 0 12px 0;
  border: 1px solid #dcdfe6;
  border-radius: 10px;
  font-size: 14px;
}

input:focus, select:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74,144,226,0.15);
  outline: none;
}

/* ===== FLEX FIX ===== */
.phone-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* ===== BUTTONS ===== */
.btn {
  cursor: pointer;
  padding: 14px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #4a90e2;
  color: white;
  width: 100%;
  margin-top: 15px;
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-secondary {
  background: #f1f5f9;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-danger {
  background: #fee2e2;
  color: #dc2626;
  padding: 6px 10px;
  font-size: 12px;
}

/* ===== GRID ===== */
.doc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

/* ===== STEP INDICATOR ===== */
.step-indicator {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 25px;
}

.step {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.step.active {
  background: #4a90e2;
  color: white;
}

/* ===== UPLOAD ===== */
.upload-label {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border: 1px dashed #cbd5e1;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
}

/* ===== EDIT BUTTON ===== */
.edit-btn {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  padding: 4px 8px;
  border-radius: 5px;
  font-size: 11px;
}

/* ===== MODAL ===== */
.modal {
  position: fixed;
  top:0;
  left:0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  z-index: 1000;
}

/* ===== MOBILE RESPONSIVE ===== */
@media (max-width: 600px) {

  .form-wrapper {
    padding: 0;
    background: #fff;
  }

  .container {
    padding: 15px;
    border-radius: 0;
    box-shadow: none;
  }

  .doc-grid {
    grid-template-columns: 1fr;
  }

  .guest-card {
    padding: 12px;
  }

  .step-indicator {
    gap: 10px;
  }

  .btn {
    padding: 12px;
    font-size: 13px;
  }

  input, select {
    padding: 10px;
    font-size: 13px;
  }

  /* IMPORTANT FIX */
  div[style*="flex"] {
    flex-wrap: wrap !important;
  }

}

/* EXTRA SMALL DEVICES */
@media (max-width: 400px) {
  .container {
    padding: 10px;
  }
}
`}</style>

      <div className="container">
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>3</div>
        </div>

        <h2>Hotel Registration</h2>
        {message && (
          <div style={{
            padding: '12px', 
            borderRadius: '8px', 
            textAlign: 'center', 
            marginBottom: '20px',
            backgroundColor: message.includes('✅') ? '#f0fdf4' : '#fef2f2',
            color: message.includes('✅') ? '#166534' : '#991b1b',
            border: `1px solid ${message.includes('✅') ? '#bbf7d0' : '#fecaca'}`
          }}>
            {message}
          </div>
        )}

        {/* STEP 1: GUESTS */}
        {step === 1 && (
          <div>
            <h3>Guest Information</h3>
            {persons.map((p, idx) => (
              <div key={idx} className="guest-card">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '10px'}}>
                   <strong style={{color: '#4a90e2'}}>Guest #{idx + 1}</strong>
                   {persons.length > 1 && <button className="btn btn-danger" onClick={() => removePerson(idx)}>Remove</button>}
                </div>
                
                <label style={{fontSize: '13px', fontWeight: '600'}}>Full Name</label>
                <input placeholder="Enter name" value={p.name} onChange={(e) => handlePersonChange(idx, "name", e.target.value)} />
                
                <div style={{display:'flex', gap:'15px'}}>
                  <div style={{flex: 1}}>
                    <label style={{fontSize: '13px', fontWeight: '600'}}>Age</label>
                    <input type="number" placeholder="0" value={p.age} onChange={(e) => handlePersonChange(idx, "age", e.target.value)} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{fontSize: '13px', fontWeight: '600'}}>Gender</label>
                    <select value={p.gender} onChange={(e) => handlePersonChange(idx, "gender", e.target.value)}>
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <label style={{fontSize: '13px', fontWeight: '600'}}>Email Address</label>
                <input type="email" placeholder="email@example.com" value={p.email} onChange={(e) => handlePersonChange(idx, "email", e.target.value)} />
                
                <label style={{fontSize: '13px', fontWeight: '600'}}>Phone Number(s)</label>
                {p.phones.map((ph, pIdx) => (
                  <div key={pIdx} className="phone-row">
                    <input placeholder="Mobile number" value={ph} onChange={(e) => handlePhoneChange(idx, pIdx, e.target.value)} />
                    {p.phones.length > 1 && <button className="btn btn-danger" style={{marginTop:'8px'}} onClick={() => removePhone(idx, pIdx)}>✕</button>}
                  </div>
                ))}
                <button className="btn btn-secondary" style={{padding:'6px 12px', fontSize:'12px'}} onClick={() => addPhone(idx)}>+ Add Another Phone</button>
              </div>
            ))}
            <button className="btn btn-secondary" style={{width: '100%'}} onClick={addPerson}>+ Add Another Guest</button>
            <button className="btn btn-primary" onClick={() => setStep(2)}>Continue to Travel Details</button>
          </div>
        )}

        {/* STEP 2: TRAVEL & STAY */}
        {step === 2 && (
          <div>
            <h3>Arrival & Stay Details</h3>
            <div className="doc-grid">
               <div>
                  <label style={{fontSize: '13px', fontWeight: '600'}}>Arrival Date</label>
                  <input type="date" value={arrival.arrivalDate} onChange={(e) => setArrival({ ...arrival, arrivalDate: e.target.value })} />
               </div>
               <div>
                  <label style={{fontSize: '13px', fontWeight: '600'}}>Arrival Time</label>
                  <input type="time" value={arrival.arrivalTime} onChange={(e) => setArrival({ ...arrival, arrivalTime: e.target.value })} />
               </div>
            </div>
            
            <label style={{fontSize: '13px', fontWeight: '600'}}>Nationality</label>
            <input placeholder="e.g. Indian" value={arrival.nationality} onChange={(e) => setArrival({ ...arrival, nationality: e.target.value })} />
            
            <label style={{fontSize: '13px', fontWeight: '600'}}>Arriving From</label>
            <input placeholder="City / State" value={arrival.location} onChange={(e) => setArrival({ ...arrival, location: e.target.value })} />
            
            <div className="doc-grid">
               <div>
                 <label style={{fontSize: '13px', fontWeight: '600'}}>Stay Type</label>
                 <input placeholder="e.g. Personal" value={stay.stayType} onChange={(e) => setStay({ ...stay, stayType: e.target.value })} />
               </div>
               <div>
                 <label style={{fontSize: '13px', fontWeight: '600'}}>Room Number</label>
                 <input placeholder="Assign No" value={stay.roomNo} onChange={(e) => setStay({ ...stay, roomNo: e.target.value })} />
               </div>
            </div>
            
            <label style={{fontSize: '13px', fontWeight: '600'}}>Duration (Days)</label>
            <input type="number" placeholder="1" value={stay.days} onChange={(e) => setStay({ ...stay, days: e.target.value })} />
            
            <div style={{display:'flex', gap:'15px'}}>
              <button className="btn btn-secondary" style={{flex:1}} onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" style={{flex:2, marginTop: '10px'}} onClick={() => setStep(3)}>Next: Documents</button>
            </div>
          </div>
        )}

        {/* STEP 3: DOCUMENTS */}
        {step === 3 && (
          <div>
            <h3>Identity Documents</h3>
            <div className="doc-grid">
  {Object.keys(documents).map((field) => (
    <div
      key={field}
      style={{
        background: "#f8fafc",
        padding: "12px",
        borderRadius: "8px",
        border: "1px dashed #cbd5e1",
      }}
    >
      <label
        style={{
          fontSize: "12px",
          fontWeight: "700",
          textTransform: "uppercase",
          color: "#475569",
        }}
      >
        {field.replace(/([A-Z])/g, " $1")}
      </label>

      {/* ✅ CAMERA + GALLERY BUTTONS */}
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        
        {/* CAMERA */}
        <label className="upload-label" style={{ flex: 1 }}>
          📷 Camera
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) =>
              handleFileSelect(e.target.files[0], field)
            }
            style={{ display: "none" }}
          />
        </label>

        {/* GALLERY */}
        <label className="upload-label" style={{ flex: 1 }}>
          🖼️ Gallery
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleFileSelect(e.target.files[0], field)
            }
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* ✅ FILE STATUS + ACTIONS */}
      {documents[field] && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "8px",
          }}
        >
          <span
            style={{
              color: "#10b981",
              fontSize: "11px",
              fontWeight: "600",
            }}
          >
            ✓ Ready
          </span>

          <div style={{ display: "flex", gap: "5px" }}>
            <button
              className="edit-btn"
              onClick={() =>
                setPreview(URL.createObjectURL(documents[field]))
              }
            >
              👁️ View
            </button>

            <button
              className="edit-btn"
              style={{
                background: "#fff7ed",
                color: "#c2410c",
                borderColor: "#ffedd5",
              }}
              onClick={() => handleEdit(field)}
            >
              ✏️ Edit
            </button>
          </div>
        </div>
      )}
    </div>
  ))}
</div>
            <div style={{display:'flex', gap:'15px', marginTop: '20px'}}>
              <button className="btn btn-secondary" style={{flex:1}} onClick={() => setStep(2)}>Back</button>
              <button 
                className="btn btn-primary" 
                style={{flex:2, marginTop: '10px'}} 
                onClick={submitForm} 
                disabled={loading}
              >
                {loading ? "Saving Booking..." : "Finish & Submit"}
              </button>
            </div>
          </div>
        )}

        {/* CROP MODAL */}
        {cropSrc && (
          <div className="modal">
            <div style={{background:'#fff', padding:'25px', borderRadius:'12px', maxWidth:'500px', width: '90%'}}>
              <h4 style={{marginTop: 0}}>Adjust Image</h4>
              <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
                <img id="crop-img" src={cropSrc} alt="crop" style={{maxWidth:'100%', borderRadius:'4px'}} />
              </ReactCrop>
              <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                <button className="btn btn-secondary" style={{flex: 1}} onClick={() => setCropSrc(null)}>Cancel</button>
                <button className="btn btn-primary" style={{flex: 1, marginTop: 0}} onClick={handleCropComplete}>Save Selection</button>
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW MODAL */}
        {preview && (
          <div className="modal" onClick={() => setPreview(null)}>
            <div style={{position:'relative'}}>
               <img src={preview} style={{maxWidth:'90vw', maxHeight: '80vh', borderRadius:'12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}} alt="preview" />
               <p style={{color:'white', textAlign:'center', marginTop:'15px', fontWeight: '600'}}>Tap anywhere to close</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MultiStepForm;