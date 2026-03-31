import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import jsPDF from "jspdf";

function OutForm() {
  const { bookingId, entryIdx } = useParams();
  const navigate = useNavigate();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [liveTime, setLiveTime] = useState("");
  const [isEditingTime, setIsEditingTime] = useState(false);

  /* =============================
      LIVE CLOCK
  ============================= */
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isEditingTime) {
        const now = new Date();
        const formatted = now.toLocaleString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        setLiveTime(formatted);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isEditingTime]);

  /* =============================
      FETCH ENTRY
  ============================= */
  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const bookingRef = doc(db, "bookings", bookingId);
        const snap = await getDoc(bookingRef);
        if (!snap.exists()) {
          setError("Booking not found ❌");
          return;
        }
        const data = snap.data();
        if (!data.entries || !data.entries[entryIdx]) {
          setError("Entry not found ❌");
          return;
        }
        setEntry(data.entries[entryIdx]);
      } catch (err) {
        console.error(err);
        setError("Failed to load entry ❌");
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [bookingId, entryIdx]);

  /* =============================
      BILL CALCULATION
  ============================= */
  const roomPricePerDay = 1200;
  const gstPercent = 18;

  const calculateBill = () => {
    if (!entry?.stay?.days) return { subtotal: 0, gst: 0, total: 0 };
    const days = Number(entry.stay.days);
    const subtotal = days * roomPricePerDay;
    const gst = (subtotal * gstPercent) / 100;
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  /* =============================
      PDF GENERATION
  ============================= */
  const generatePDF = () => {
    const docPdf = new jsPDF();
    const { subtotal, gst, total } = calculateBill();
    docPdf.setFontSize(18);
    docPdf.text("Hotel Checkout Receipt", 20, 20);
    docPdf.setFontSize(12);
    docPdf.text(`Guest Name: ${entry.name}`, 20, 40);
    docPdf.text(`Room No: ${entry.stay?.roomNo}`, 20, 50);
    docPdf.text(`Days Stayed: ${entry.stay?.days}`, 20, 60);
    docPdf.text(`Checkout Time: ${liveTime}`, 20, 70);
    docPdf.text(`Subtotal: ₹${subtotal}`, 20, 80);
    docPdf.text(`GST (18%): ₹${gst}`, 20, 90);
    docPdf.text(`Total Amount: ₹${total}`, 20, 100);
    docPdf.text("Thank You For Staying With Us!", 20, 120);
    docPdf.save(`Checkout_${entry.name}.pdf`);
  };

  /* =============================
      SUBMIT OUT
  ============================= */
  const handleSubmitOut = async () => {
    try {
      setSubmitting(true);
      const bookingRef = doc(db, "bookings", bookingId);
      const snap = await getDoc(bookingRef);
      if (!snap.exists()) {
        alert("Booking not found ❌");
        return;
      }
      const bookingData = snap.data();
      const updatedEntries = bookingData.entries.filter((_, i) => i !== Number(entryIdx));
      const { subtotal, gst, total } = calculateBill();

      await addDoc(collection(db, "adminPanel"), {
        ...entry,
        bookingId,
        checkoutTime: liveTime,
        subtotal,
        gst,
        totalAmount: total,
        outAt: serverTimestamp(),
      });

      await updateDoc(bookingRef, {
        entries: updatedEntries,
        updatedAt: serverTimestamp(),
      });

      alert("Guest Checked Out Successfully ✅");
      navigate(`/verify-edit/${bookingId}`);
    } catch (err) {
      console.error(err);
      alert("Checkout Failed ❌");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loader">Initializing Billing...</div>;
  if (error) return <div className="loader error">{error}</div>;

  const { subtotal, gst, total } = calculateBill();

  return (
    <div className="out-wrapper">
      <style>{`
        .out-wrapper {
          min-height: 100vh;
          width: 100vw;
          background-color: #f1f5f9; /* Soft Light Gray */
          display: flex;
          justify-content: center;
          padding: 40px 20px;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
          color: #1e293b;
        }

        .checkout-card {
          width: 100%;
          max-width: 550px;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .card-header {
          background: #f8fafc;
          padding: 25px;
          text-align: center;
          border-bottom: 2px solid #f1f5f9;
        }

        .card-header h2 { 
          margin: 0; 
          font-size: 20px; 
          letter-spacing: 1px; 
          color: #334155; 
          font-weight: 800;
        }

        .receipt-body { padding: 30px; }

        .time-box {
          background: #fdfdfd;
          padding: 12px 15px;
          border-radius: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
        }

        .time-text { font-family: monospace; color: #059669; font-weight: bold; font-size: 1rem; }

        .info-section {
          margin-bottom: 20px;
          border-bottom: 1px dashed #cbd5e1;
          padding-bottom: 15px;
        }

        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .info-label { color: #64748b; font-weight: 500; }
        .info-value { font-weight: 700; color: #1e293b; }

        .billing-table {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-top: 10px;
        }

        .total-row {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #3b82f6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .total-price { font-size: 26px; color: #2563eb; font-weight: 900; }

        .btn-group { display: flex; flex-direction: column; gap: 10px; margin-top: 30px; }

        .btn {
          padding: 14px;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 15px;
        }

        .btn-confirm { background: #2563eb; color: white; }
        .btn-confirm:hover { background: #1d4ed8; }
        .btn-confirm:disabled { background: #cbd5e1; cursor: not-allowed; }

        .btn-pdf { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
        .btn-pdf:hover { background: #e2e8f0; }

        .btn-back { background: transparent; color: #94a3b8; font-size: 13px; text-decoration: none; margin-bottom: 15px; display: inline-block; }
        .btn-back:hover { color: #3b82f6; }

        .edit-link { font-size: 12px; color: #3b82f6; cursor: pointer; font-weight: bold; }

        .loader { height: 100vh; display: flex; align-items: center; justify-content: center; color: #2563eb; font-size: 18px; font-weight: 600; }
      `}</style>

      <div className="checkout-card">
        <div className="card-header">
          <h2>INVOICE SUMMARY</h2>
        </div>

        <div className="receipt-body">
          {/* BACK BUTTON */}
          <button className="btn-back" onClick={() => navigate(`/verify-edit/${bookingId}`)}>
            ← Back to Guest Records
          </button>

          {/* LIVE TIME */}
          <div className="time-box">
            <div>
              <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', fontWeight: '800' }}>TIMESTAMP</span>
              {isEditingTime ? (
                <input 
                  value={liveTime} 
                  onChange={(e) => setLiveTime(e.target.value)} 
                  style={{ background: 'white', border: '1px solid #3b82f6', color: '#1e293b', padding: '2px', borderRadius: '4px' }} 
                />
              ) : (
                <span className="time-text">{liveTime}</span>
              )}
            </div>
            <span className="edit-link" onClick={() => setIsEditingTime(!isEditingTime)}>
              {isEditingTime ? "DONE" : "EDIT"}
            </span>
          </div>

          {/* GUEST INFO */}
          <div className="info-section">
            <div className="info-row">
              <span className="info-label">Guest</span>
              <span className="info-value">{entry.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Room</span>
              <span className="info-value">#{entry.stay?.roomNo}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Stay Duration</span>
              <span className="info-value">{entry.stay?.days} Days</span>
            </div>
          </div>

          {/* BILLING */}
          <div className="billing-table">
            <div className="info-row">
              <span className="info-label">Base Rate</span>
              <span className="info-value">₹{roomPricePerDay} / day</span>
            </div>
            <div className="info-row">
              <span className="info-label">Subtotal</span>
              <span className="info-value">₹{subtotal}</span>
            </div>
            <div className="info-row" style={{ color: '#ef4444' }}>
              <span className="info-label">Tax (GST 18%)</span>
              <span className="info-value">+ ₹{gst}</span>
            </div>

            <div className="total-row">
              <span style={{ fontWeight: '800', fontSize: '14px' }}>TOTAL DUE</span>
              <span className="total-price">₹{total}</span>
            </div>
          </div>

          <div className="btn-group">
            <button 
              className="btn btn-confirm" 
              onClick={handleSubmitOut} 
              disabled={submitting}
            >
              {submitting ? "Finalizing..." : "Complete Checkout"}
            </button>
            <button className="btn btn-pdf" onClick={generatePDF}>
              Download PDF Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OutForm;