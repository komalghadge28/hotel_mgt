import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

// ✅ NEW: just return URL directly (no supabase)
const getFileUrl = (url) => {
  return url || null;
};

function ViewData() {
  const navigate = useNavigate();
  const [guests, setGuests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState("name");
  const [searchText, setSearchText] = useState("");
  const [docModal, setDocModal] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const bookingSnap = await getDocs(collection(db, "bookings"));
        const checkoutSnap = await getDocs(collection(db, "adminPanel"));
        let all = [];

        bookingSnap.forEach((d) => {
          const booking = d.data();
          booking.entries?.forEach((e, i) => {
            all.push({
              ...e,
              source: "bookings",
              bookingId: d.id,
              index: i,
              createdAt: booking.createdAt?.toDate(),
              status: "Checked In",
              documents: {
                aadhar: getFileUrl(e.aadharUrl),
                pan: getFileUrl(e.panUrl),
                license: getFileUrl(e.licenseUrl),
                passport: getFileUrl(e.passportUrl),
                photo: getFileUrl(e.photoUrl),
              },
            });
          });
        });

        checkoutSnap.forEach((d) => {
          const data = d.data();
          all.push({
            ...data,
            source: "adminPanel",
            docId: d.id,
            status: "Checked Out",
            createdAt: data.createdAt?.toDate(),
            documents: {
              aadhar: getFileUrl(data.aadharUrl),
              pan: getFileUrl(data.panUrl),
              license: getFileUrl(data.licenseUrl),
              passport: getFileUrl(data.passportUrl),
              photo: getFileUrl(data.photoUrl),
            },
          });
        });

        setGuests(all);
        setFiltered(all);
      } catch (e) {
        console.error(e);
        alert("Load failed");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    let result = guests;
    if (searchText) {
      result = guests.filter((g) => {
        if (searchType === "name") return g.name?.toLowerCase().includes(searchText.toLowerCase());
        if (searchType === "phone") return g.phones?.some((p) => p.includes(searchText));
        if (searchType === "date") return g.createdAt && g.createdAt.toISOString().slice(0, 10).includes(searchText);
        return true;
      });
    }
    setFiltered(result);
  }, [searchText, searchType, guests]);

  const handleDelete = async (g) => {
    if (!window.confirm("Delete record?")) return;
    try {
      if (g.source === "adminPanel") {
        await deleteDoc(doc(db, "adminPanel", g.docId));
      } else {
        alert("Checkout first");
        return;
      }
      setGuests((p) => p.filter((x) => x !== g));
    } catch {
      alert("Delete failed");
    }
  };

  const deleteDocLink = async (guest, key) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      if (guest.source !== "bookings") return;
      const ref = doc(db, "bookings", guest.bookingId);
      await updateDoc(ref, { [`entries.${guest.index}.${key}Url`]: null });
      alert("Document deleted");
      window.location.reload();
    } catch {
      alert("Failed");
    }
  };

  if (loading) return <div style={styles.loader}>Loading Dashboard...</div>;

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        <button 
          onClick={() => navigate("/admin/dashboard")} 
          style={styles.backBtn}
          onMouseOver={(e) => e.target.style.backgroundColor = "#e2e8f0"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#fff"}
        >
          ⬅ Back to Dashboard
        </button>

        <header style={styles.header}>
          <h2 style={styles.title}>Guest Management System</h2>
          <p style={styles.subtitle}>Overview of all checked-in and archived guests</p>
        </header>

        <div style={styles.searchCard}>
          <div style={styles.inputGroup}>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={styles.select}
            >
              <option value="name">Filter by Name</option>
              <option value="phone">Filter by Phone</option>
              <option value="date">Filter by Date</option>
            </select>

            <input
              type={searchType === "date" ? "date" : "text"}
              placeholder="Type your search here..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Room</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Documents</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g, i) => (
                <tr key={i} style={styles.tr}>
                  <td style={styles.td}><strong>{g.name}</strong></td>
                  <td style={styles.td}>{g.phones?.join(", ")}</td>
                  <td style={styles.td}>{g.stay?.roomNo || "N/A"}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: g.status === "Checked In" ? "#fee2e2" : "#dcfce7",
                      color: g.status === "Checked In" ? "#dc2626" : "#16a34a",
                    }}>
                      {g.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.viewBtn} onClick={() => setDocModal(g)}>
                      📂 View Files
                    </button>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(g)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {docModal && (
        <div style={styles.modalBg}>
          <div style={styles.modal}>
            <h3 style={{marginTop: 0, color: '#1e293b'}}>Documents: {docModal.name}</h3>
            {Object.entries(docModal.documents).map(([k, v]) => (
              <div key={k} style={styles.docRow}>
                <span style={{fontWeight: '600', color: '#64748b'}}>{k.toUpperCase()}</span>
                <div style={{display:'flex', alignItems:'center', gap: '10px'}}>
                  {v ? (
                    <>
                      <a href={v} target="_blank" rel="noreferrer" style={styles.link}>View</a>
                      <button onClick={() => deleteDocLink(docModal, k)} style={styles.smallDel}>✕</button>
                    </>
                  ) : <span style={{fontSize: '12px', color: '#94a3b8'}}>Not Found</span>}
                </div>
              </div>
            ))}
            <button style={styles.closeBtn} onClick={() => setDocModal(null)}>Close Window</button>
          </div>
        </div>
      )}
    </div>
  );
}

;

const styles = {
  pageWrapper: {
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 0",
    boxSizing: "border-box",
  },
  container: {
    width: "95%",
    maxWidth: "1100px",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  backBtn: {
    backgroundColor: "#fff",
    color: "#475569",
    border: "1px solid #e2e8f0",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    marginBottom: "20px",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "16px",
    margin: 0,
  },
  searchCard: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    marginBottom: "30px",
  },
  inputGroup: {
    display: "flex",
    gap: "15px",
  },
  select: {
    flex: "1",
    padding: "12px 15px",
    borderRadius: "10px",
    border: "2px solid #e2e8f0",
    backgroundColor: "#f1f5f9",
    color: "#1e293b",
    fontSize: "14px",
    fontWeight: "600",
    outline: "none",
  },
  searchInput: {
    flex: "3",
    padding: "12px 15px",
    borderRadius: "10px",
    border: "2px solid #e2e8f0",
    backgroundColor: "#f1f5f9",
    color: "#1e293b",
    fontSize: "14px",
    outline: "none",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#f8fafc",
    padding: "20px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#64748b",
    borderBottom: "2px solid #f1f5f9",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background 0.2s",
  },
  td: {
    padding: "18px 20px",
    fontSize: "14px",
    color: "#334155",
  },
  badge: {
    padding: "6px 14px",
    borderRadius: "99px",
    fontSize: "12px",
    fontWeight: "700",
  },
  viewBtn: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #dbeafe",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  deleteBtn: {
    backgroundColor: "#fff",
    color: "#ef4444",
    border: "1px solid #fee2e2",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  modalBg: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "20px",
    width: "450px",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
  },
  docRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "14px",
  },
  smallDel: {
    background: "none",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    fontSize: "18px",
  },
  closeBtn: {
    width: "100%",
    marginTop: "25px",
    padding: "12px",
    backgroundColor: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },
  loader: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px",
    color: "#64748b",
  }
};

export default ViewData;