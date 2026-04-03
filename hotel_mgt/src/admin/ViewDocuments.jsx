import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function ViewDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "bookings")); // fetch from bookings
        const docs = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.entries && Array.isArray(data.entries)) {
            data.entries.forEach((entry) => {
              ["aadharFront", "aadharBack", "pan", "license", "passport", "photo"].forEach((key) => {
                if (entry[key]) {
                  docs.push({
                    id: `${docSnap.id}_${key}`,
                    type: key,
                    url: entry[key],
                  });
                }
              });
            });
          }
        });

        if (isMounted) {
          setDocuments(docs);
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;

    try {
      // Delete only the booking doc, because images are nested in entries
      const [docId] = id.split("_"); 
      await deleteDoc(doc(db, "bookings", docId));
      setDocuments((prev) => prev.filter((item) => !item.id.startsWith(docId)));
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  return (
    <div className="docs-wrapper">
      <style>{`
        .docs-wrapper { min-height: 100vh; padding: 20px; background: #0f172a; font-family: 'Inter', sans-serif; color: #fff; }
        .header-area { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap:10px;}
        .header-area h2 { font-size:1.5rem; margin:0; }
        .back-btn { padding:8px 14px; background:#334155; border:none; border-radius:6px; color:#fff; cursor:pointer; font-size:13px; transition:0.2s;}
        .back-btn:hover { background:#475569; }
        .grid-container { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:15px; }
        .doc-card { background:#1e293b; padding:15px; border-radius:10px; border:1px solid #334155; display:flex; flex-direction:column; transition:0.3s;}
        .doc-card:hover { transform:translateY(-5px); box-shadow:0 10px 20px rgba(0,0,0,0.2);}
        .doc-type { font-size:12px; font-weight:700; color:#38bdf8; margin-bottom:8px;}
        .doc-image { width:100%; height:140px; object-fit:cover; border-radius:6px; background:#334155;}
        .doc-actions { display:flex; justify-content:space-between; margin-top:10px;}
        .doc-actions a { color:#38bdf8; font-size:13px; text-decoration:none; font-weight:600;}
        .doc-actions a:hover { text-decoration:underline; }
        .delete-btn { background:#ef4444; border:none; padding:5px 10px; border-radius:5px; color:#fff; cursor:pointer; font-size:12px; font-weight:600; transition:0.2s;}
        .delete-btn:hover { background:#b91c1c; }
        .loading, .no-docs { text-align:center; margin-top:50px; font-size:1.1rem; font-weight:600; }
        @media(max-width:480px) {
          .header-area h2 { font-size:1.3rem; }
          .back-btn { font-size:12px; padding:6px 10px; }
          .doc-actions a, .delete-btn { font-size:11px; padding:4px 8px; }
        }
      `}</style>

      <div className="header-area">
        <h2>All Documents</h2>
        <button className="back-btn" onClick={() => navigate(-1)}>⬅ Back</button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : documents.length === 0 ? (
        <div className="no-docs">No documents found</div>
      ) : (
        <div className="grid-container">
          {documents.map((doc) => (
            <div className="doc-card" key={doc.id}>
              <div className="doc-type">{doc.type}</div>
              <img src={doc.url} alt={doc.type} className="doc-image" />
              <div className="doc-actions">
                <a href={doc.url} target="_blank" rel="noreferrer">View</a>
                <button className="delete-btn" onClick={() => handleDelete(doc.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ViewDocuments;