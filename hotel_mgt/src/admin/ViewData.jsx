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

const getFileUrl = (url) => url || null;

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
        if (searchType === "name")
          return g.name?.toLowerCase().includes(searchText.toLowerCase());

        if (searchType === "phone")
          return g.phones?.some((p) => p.includes(searchText));

        if (searchType === "date")
          return (
            g.createdAt &&
            g.createdAt.toISOString().slice(0, 10).includes(searchText)
          );

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

      setGuests((prev) => prev.filter((x) => x !== g));
    } catch {
      alert("Delete failed");
    }
  };

  const deleteDocLink = async (guest, key) => {
    if (!window.confirm("Delete document?")) return;

    try {
      const ref = doc(db, "bookings", guest.bookingId);
      await updateDoc(ref, {
        [`entries.${guest.index}.${key}Url`]: null,
      });

      alert("Deleted");
      window.location.reload();
    } catch {
      alert("Failed");
    }
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="viewdata-wrapper">
      <style>{`
        /* General */
        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background: #f1f5f9;
        }
        .viewdata-wrapper {
          min-height: 100vh;
          padding: 20px;
          box-sizing: border-box;
          color: #1e293b;
        }
        .back-btn {
          padding: 10px 16px;
          background: #fff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 20px;
          transition: 0.2s;
        }
        .back-btn:hover {
          background: #e2e8f0;
        }

        /* Header */
        .header-area {
          text-align: center;
          margin-bottom: 25px;
        }
        .header-area h2 {
          margin: 0;
          font-size: 2rem;
          font-weight: 800;
        }
        .header-area p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 0.95rem;
        }

        /* Search Box */
        .search-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }
        .search-wrapper select,
        .search-wrapper input {
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          flex: 1;
          min-width: 120px;
        }

        /* Table */
        .table-wrapper {
          overflow-x: auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }
        thead {
          background: #e2e8f0;
        }
        th, td {
          padding: 12px 15px;
          text-align: left;
        }
        tbody tr {
          border-bottom: 1px solid #f1f5f9;
        }
        tbody tr:hover {
          background: #f1f5f9;
        }
        .status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }
        .status-checkedin {
          background: #fee2e2;
          color: #b91c1c;
        }
        .status-checkedout {
          background: #dcfce7;
          color: #15803d;
        }
        .action-btn {
          padding: 6px 10px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: 0.2s;
        }
        .action-btn.view-btn {
          background: #3b82f6;
          color: white;
          margin-right: 5px;
        }
        .action-btn.view-btn:hover {
          background: #2563eb;
        }
        .action-btn.delete-btn {
          background: #ef4444;
          color: white;
        }
        .action-btn.delete-btn:hover {
          background: #b91c1c;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
        }
        .modal-content {
          background: #fff;
          border-radius: 12px;
          padding: 25px;
          width: 90%;
          max-width: 400px;
          text-align: center;
        }
        .modal-content h3 {
          margin-top: 0;
        }
        .modal-doc {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 10px 0;
        }
        .modal-doc a {
          color: #3b82f6;
          margin-right: 8px;
        }
        .modal-doc button {
          padding: 4px 8px;
          border: none;
          background: #ef4444;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        }
        .modal-doc button:hover {
          background: #b91c1c;
        }
        .modal-close {
          margin-top: 15px;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          background: #64748b;
          color: white;
          cursor: pointer;
        }
        .modal-close:hover {
          background: #475569;
        }

        /* Loading */
        .loading-wrapper {
          text-align: center;
          margin-top: 50px;
          font-size: 1.2rem;
          font-weight: 600;
        }

        /* Responsive */
        @media (max-width: 768px) {
          th, td { padding: 10px 8px; }
          table { min-width: 100%; }
        }

        @media (max-width: 480px) {
          .header-area h2 { font-size: 1.6rem; }
          .search-wrapper { flex-direction: column; gap: 8px; }
          .action-btn { font-size: 12px; padding: 5px 8px; }
        }
      `}</style>

      {/* BACK */}
      <button className="back-btn" onClick={() => navigate("/admin/dashboard")}>
        ⬅ Back
      </button>

      {/* HEADER */}
      <div className="header-area">
        <h2>Guest Management</h2>
        <p>All guest records</p>
      </div>

      {/* SEARCH */}
      <div className="search-wrapper">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="name">Name</option>
          <option value="phone">Phone</option>
          <option value="date">Date</option>
        </select>

        <input
          type={searchType === "date" ? "date" : "text"}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search..."
        />
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Room</th>
              <th>Status</th>
              <th>Docs</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((g, i) => (
              <tr key={i}>
                <td>{g.name}</td>
                <td>{g.phones?.join(", ")}</td>
                <td>{g.stay?.roomNo || "N/A"}</td>
                <td>
                  <span
                    className={`status-badge ${
                      g.status === "Checked In"
                        ? "status-checkedin"
                        : "status-checkedout"
                    }`}
                  >
                    {g.status}
                  </span>
                </td>
                <td>
                  <button
                    className="action-btn view-btn"
                    onClick={() => setDocModal(g)}
                  >
                    View
                  </button>
                </td>
                <td>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(g)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {docModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{docModal.name}</h3>

            {Object.entries(docModal.documents).map(([k, v]) => (
              <div key={k} className="modal-doc">
                <span>{k}</span>
                {v ? (
                  <>
                    <a href={v} target="_blank">View</a>
                    <button onClick={() => deleteDocLink(docModal, k)}>❌</button>
                  </>
                ) : (
                  <span>Not Found</span>
                )}
              </div>
            ))}

            <button className="modal-close" onClick={() => setDocModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewData;