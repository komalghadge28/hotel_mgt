import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
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
      console.error("Load Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [usersRef]);

  const addFirebaseUser = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      await setDoc(doc(db, "users", uid), { email, createdAt: new Date() });
      alert("User Added ✅");
    } catch (err) {
      alert("Failed: " + err.message);
    }
  };

  const saveUser = async () => {
    if (!email.trim() || (!editId && !password.trim())) {
      alert("Enter valid details");
      return;
    }

    if (editId) {
      await updateDoc(doc(db, "users", editId), { email });
      alert("Updated ✅");
    } else {
      await addFirebaseUser(email, password);
    }

    clearForm();
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete user?")) return;
    await deleteDoc(doc(db, "users", id));
    fetchUsers();
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
    return <div className="loader">Loading...</div>;
  }

  return (
    <div className="page-wrapper">
      <style>{`
        .page-wrapper {
          min-height: 100vh;
          background: #f8fafc;
          padding: 20px;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
        }
        .header {
          margin-bottom: 25px;
          position: relative;
          padding-top: 40px;
        }
        .back-btn {
          position: absolute;
          left: 0;
          top: 0;
          padding: 6px 12px;
          border: 1px solid #e2e8f0;
          background: #fff;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: #475569;
          transition: 0.2s;
        }
        .back-btn:hover {
          background: #f1f5f9;
        }
        .title {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 4px 0;
        }
        .subtitle {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }
        .card {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
        }
        .cardTitle {
          font-size: 16px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 15px;
        }
        .formGrid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 15px;
        }
        .input {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 14px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
        }
        .buttonRow {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .primaryBtn {
          background: #4f46e5;
          color: #fff;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          flex: 1;
          min-width: 120px;
          transition: 0.2s;
        }
        .primaryBtn:hover { background: #4338ca; }
        .cancelBtn {
          background: #f1f5f9;
          color: #475569;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }
        .cancelBtn:hover { background: #e2e8f0; }
        .tableCard {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }
        .tableHeader {
          padding: 15px 20px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .userCount {
          font-size: 12px;
          background: #e0e7ff;
          color: #4338ca;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
        }
        .tableWrapper {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          text-align: left;
        }
        th {
          background: #f8fafc;
          padding: 12px 20px;
          color: #64748b;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
        }
        td {
          padding: 12px 20px;
          vertical-align: middle;
        }
        tr {
          border-bottom: 1px solid #f1f5f9;
        }
        .actionGroup {
          display: flex;
          gap: 8px;
        }
        .editBtn {
          background: #f0f9ff;
          color: #0369a1;
          padding: 6px 12px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: 0.2s;
        }
        .editBtn:hover { background: #e0f2fe; }
        .deleteBtn {
          background: #fff1f2;
          color: #be123c;
          padding: 6px 12px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: 0.2s;
        }
        .deleteBtn:hover { background: #fecdd3; }
        .noData {
          text-align: center;
          padding: 30px;
          color: #94a3b8;
        }
        .loader {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #4f46e5;
          font-weight: bold;
          background: #f8fafc;
        }

        @media (max-width: 600px) {
          .header { padding-top: 20px; }
          .title { font-size: 20px; }
          .subtitle { font-size: 13px; }
          th, td { padding: 10px 12px; font-size: 13px; }
          .input { padding: 10px; font-size: 13px; }
          .primaryBtn, .cancelBtn { padding: 8px 16px; font-size: 13px; }
        }
      `}</style>

      <div className="container">
        <div className="header">
          <button className="back-btn" onClick={() => navigate("/admin/dashboard")}>← Back</button>
          <h2 className="title">User Management</h2>
          <p className="subtitle">Manage admin access and roles</p>
        </div>

        <div className="card">
          <h3 className="cardTitle">{editId ? "Edit User" : "Add New User"}</h3>
          <div className="formGrid">
            <input
              type="email"
              placeholder="Email Address"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {!editId && (
              <input
                type="password"
                placeholder="Password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
          </div>

          <div className="buttonRow">
            <button className="primaryBtn" onClick={saveUser}>
              {editId ? "Update User" : "Create User"}
            </button>
            {editId && (
              <button className="cancelBtn" onClick={clearForm}>Cancel</button>
            )}
          </div>
        </div>

        <div className="tableCard">
          <div className="tableHeader">
            <h3 className="cardTitle">Current Users</h3>
            <span className="userCount">{users.length} Users</span>
          </div>
          <div className="tableWrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>User Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="noData">No users found in database</td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr key={u.id}>
                      <td>{i + 1}</td>
                      <td><span style={{ fontWeight: 500, color: "#334155" }}>{u.email}</span></td>
                      <td>
                        <div className="actionGroup">
                          <button className="editBtn" onClick={() => editUser(u)}>Edit</button>
                          <button className="deleteBtn" onClick={() => deleteUser(u.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageUsers;