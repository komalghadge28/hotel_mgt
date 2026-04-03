import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

function EmployeeWorkReport() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const q = query(collection(db, "employeeOut"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecords(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
      setLoading(false);
    };
    fetchReports();
  }, []);

  if (loading) return (
    <div className="loaderContainer">
      <div className="loader">Loading Work Reports...</div>
    </div>
  );

  return (
    <div className="pageWrapper">
      <style>{`
        .pageWrapper {
          background-color: #f1f5f9;
          min-height: 100vh;
          padding: 20px 10px;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
        }
        .container {
          max-width: 1000px;
          margin: 0 auto;
        }
        .headerSection {
          margin-bottom: 25px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .backBtn {
          align-self: flex-start;
          background-color: #fff;
          border: 1px solid #e2e8f0;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          color: #64748b;
          font-size: 13px;
          transition: 0.2s;
        }
        .backBtn:hover { background-color: #f1f5f9; }
        .title {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin: 10px 0 0 0;
        }
        .subtitle {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }
        .tableCard {
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }
        .tableResponsive {
          overflow-x: auto;
          width: 100%;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 700px;
        }
        th {
          background-color: #f8fafc;
          padding: 14px 20px;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          text-align: left;
          text-transform: uppercase;
          border-bottom: 2px solid #f1f5f9;
        }
        td {
          padding: 16px 20px;
          font-size: 14px;
          color: #1e293b;
        }
        .tr {
          border-bottom: 1px solid #f1f5f9;
        }
        .nameText {
          font-weight: 600;
          color: #1e293b;
        }
        .timeContainer {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .timeArrow { color: #94a3b8; font-size: 12px; }
        .timeBadgeIn {
          background-color: #f0fdf4;
          color: #15803d;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 12px;
          border: 1px solid #dcfce7;
        }
        .timeBadgeOut {
          background-color: #fef2f2;
          color: #b91c1c;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 12px;
          border: 1px solid #fee2e2;
        }
        .viewBtn {
          color: #4f46e5;
          text-decoration: none;
          font-weight: 600;
          font-size: 13px;
          transition: 0.2s;
        }
        .viewBtn:hover { text-decoration: underline; }
        .tdMuted { font-size: 12px; color: #94a3b8; padding: 16px 20px; }
        .emptyState {
          padding: 60px 20px;
          text-align: center;
          color: #94a3b8;
        }
        .loaderContainer {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f8fafc;
        }
        .loader { color: #64748b; font-weight: 500; }

        @media (max-width: 600px) {
          .title { font-size: 20px; }
          .subtitle { font-size: 13px; }
          th, td { padding: 10px 12px; font-size: 13px; }
        }
      `}</style>

      <div className="container">
        <div className="headerSection">
          <button className="backBtn" onClick={() => navigate("/admin/dashboard")}>← Dashboard</button>
          <h2 className="title">Employee Work Report</h2>
          <p className="subtitle">Daily activity logs and time tracking</p>
        </div>

        <div className="tableCard">
          {records.length === 0 ? (
            <div className="emptyState">
              <span style={{ fontSize: "48px" }}>📁</span>
              <p>No employee records found.</p>
            </div>
          ) : (
            <div className="tableResponsive">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>In/Out</th>
                    <th>Evidence</th>
                    <th>Logged At</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="tr">
                      <td><div className="nameText">{record.name}</div></td>
                      <td>{record.date}</td>
                      <td>
                        <div className="timeContainer">
                          <span className="timeBadgeIn">{record.inTime}</span>
                          <span className="timeArrow">→</span>
                          <span className="timeBadgeOut">{record.outTime}</span>
                        </div>
                      </td>
                      <td>
                        {record.photoUrl ? (
                          <a href={record.photoUrl} target="_blank" rel="noreferrer" className="viewBtn">View Photo</a>
                        ) : <span style={{ color: '#cbd5e1' }}>No Photo</span>}
                      </td>
                      <td className="tdMuted">
                        {record.createdAt?.seconds
                          ? new Date(record.createdAt.seconds * 1000).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeWorkReport;