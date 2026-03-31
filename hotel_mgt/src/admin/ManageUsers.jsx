import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const usersRef = useMemo(() => collection(db, "users"), []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getDocs(usersRef);
      setUsers(data.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      // Removed 'err' to resolve eslint no-unused-vars
      console.error("Load Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersRef]);

  const addFirebaseUser = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      await setDoc(doc(db, "users", uid), { email, createdAt: new Date() });
      alert("User Added ✅");
    } catch (err) {
      // Kept 'err' here because it is used in the alert below
      alert("Failed to create user: " + err.message);
    }
  };

  const saveUser = async () => {
    if (!email.trim() || (!editId && !password.trim())) {
      alert("Please provide valid credentials");
      return;
    }
    try {
      if (editId) {
        await updateDoc(doc(db, "users", editId), { email });
        alert("User Updated ✅");
        clearForm();
        fetchUsers();
      } else {
        await addFirebaseUser(email, password);
        clearForm();
        fetchUsers();
      }
    } catch {
      // Removed 'err' to resolve eslint no-unused-vars
      alert("Operation Failed ❌");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      alert("User Deleted ✅");
      fetchUsers();
    } catch {
      // Removed 'err' to resolve eslint no-unused-vars
      alert("Delete Failed ❌");
    }
  };

  const editUser = (user) => {
    setEditId(user.id);
    setEmail(user.email);
    setPassword(""); 
  };

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setEditId(null);
  };

  if (loading && users.length === 0) {
    return <div style={styles.loader}>Loading Admin Database...</div>;
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.headerSection}>
          <button style={styles.backBtn} onClick={() => navigate("/admin/dashboard")}>
            ← Back
          </button>
          <h2 style={styles.title}>User Management</h2>
          <p style={styles.subtitle}>Create and manage administrative access</p>
        </div>

        {/* FORM SECTION */}
        <div style={styles.formCard}>
          <div style={styles.inputGroup}>
            <input 
              type="email" 
              placeholder="User Email" 
              style={styles.input} 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            {!editId && (
              <input 
                type="password" 
                placeholder="Password" 
                style={styles.input} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            )}
          </div>
          <div style={styles.actionRow}>
            <button style={styles.saveBtn} onClick={saveUser}>
              {editId ? "Update User" : "Create Admin User"}
            </button>
            {editId && <button onClick={clearForm} style={styles.cancelBtn}>Cancel</button>}
          </div>
        </div>

        {/* TABLE SECTION */}
        <div style={styles.tableWrapper}>
          <h3 style={styles.tableTitle}>Registered Administrators</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Email Address</th>
                <th style={styles.th}>Manage</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="3" style={styles.noData}>No users found.</td>
                </tr>
              ) : (
                users.map((u, i) => (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>{i + 1}</td>
                    <td style={{...styles.td, fontWeight: '600'}}>{u.email}</td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => editUser(u)}>Edit</button>
                      <button style={styles.deleteBtn} onClick={() => deleteUser(u.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 0",
    margin: 0,
    boxSizing: "border-box",
    fontFamily: "'Inter', sans-serif",
    position: "absolute",
    left: 0,
    top: 0
  },
  container: {
    width: "90%",
    maxWidth: "850px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
  },
  headerSection: {
    textAlign: "center",
    marginBottom: "30px",
    position: "relative",
    width: "100%",
  },
  backBtn: {
    position: "absolute",
    left: "0",
    top: "5px",
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    color: "#64748b",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#1e293b",
    margin: "0 0 5px 0",
  },
  subtitle: {
    color: "#64748b",
    margin: 0,
    fontSize: "16px",
  },
  formCard: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    marginBottom: "30px",
    border: "1px solid #e2e8f0",
  },
  inputGroup: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
  },
  input: {
    flex: 1,
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#f8fafc",
    color: "#64748b", 
  },
  actionRow: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
  },
  saveBtn: {
    backgroundColor: "#4f46e5",
    color: "#fff",
    padding: "12px 28px",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },
  cancelBtn: {
    backgroundColor: "#94a3b8",
    color: "#fff",
    padding: "12px 28px",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },
  tableWrapper: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0",
  },
  tableTitle: {
    padding: "20px 25px",
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    borderBottom: "1px solid #f1f5f9",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#f8fafc",
    padding: "15px 25px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "15px 25px",
    fontSize: "14px",
    color: "#334155",
  },
  editBtn: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    border: "none",
    padding: "6px 14px",
    borderRadius: "6px",
    marginRight: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  deleteBtn: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    border: "none",
    padding: "6px 14px",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
  },
  noData: {
    padding: "40px",
    textAlign: "center",
    color: "#94a3b8",
  },
  loader: {
    height: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px",
    color: "#64748b",
    backgroundColor: "#f8fafc",
  }
};

export default ManageUsers;