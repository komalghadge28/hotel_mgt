import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function ViewDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ✅ reusable function (for delete refresh)
  const fetchDocuments = async () => {
    setLoading(true);

    try {
      const querySnapshot = await getDocs(collection(db, "documents"));

      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDocuments(docs);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // ✅ clean useEffect (NO WARNING)
  useEffect(() => {
    (async () => {
      await fetchDocuments();
    })();
  }, []);

  // ✅ delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file?")) return;

    await deleteDoc(doc(db, "documents", id));
    fetchDocuments(); // refresh
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>My Documents</h2>
        <button onClick={() => navigate(-1)}>⬅ Back</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : documents.length === 0 ? (
        <p>No documents found</p>
      ) : (
        <div style={styles.grid}>
          {documents.map((doc) => (
            <div key={doc.id} style={styles.card}>
              <b>{doc.type}</b>

              <img src={doc.url} style={styles.img} />

              <div style={styles.actions}>
                <a href={doc.url} target="_blank" rel="noreferrer">
                  View
                </a>

                <button onClick={() => handleDelete(doc.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ViewDocuments;

const styles = {
  container: {
    padding: "30px",
    background: "#0f172a",
    minHeight: "100vh",
    color: "#fff",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 250px)",
    gap: "20px",
  },

  card: {
    background: "#1e293b",
    padding: "15px",
    borderRadius: "10px",
  },

  img: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "8px",
  },

  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
};