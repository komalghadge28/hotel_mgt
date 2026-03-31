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
        const q = query(
          collection(db, "employeeOut"),
          orderBy("createdAt", "desc")
        );
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
    <div style={styles.loaderContainer}>
      <div style={styles.loader}>Loading Work Reports...</div>
    </div>
  );

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        {/* Header Section */}
        <div style={styles.headerSection}>
          <button style={styles.backBtn} onClick={() => navigate("/admin/dashboard")}>
            ← Dashboard
          </button>
          <h2 style={styles.title}>Employee Work Report</h2>
          <p style={styles.subtitle}>Review daily clock-in/out logs and activity</p>
        </div>

        {/* Content Section */}
        <div style={styles.tableCard}>
          {records.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={{ fontSize: "48px" }}>📁</span>
              <p>No employee records found in the database.</p>
            </div>
          ) : (
            <div style={styles.tableResponsive}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Employee Name</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>In Time</th>
                    <th style={styles.th}>Out Time</th>
                    <th style={styles.th}>Photo</th>
                    <th style={styles.th}>Log Time</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: "600", color: "#1e293b" }}>
                        {record.name}
                      </td>
                      <td style={styles.td}>{record.date}</td>
                      <td style={styles.td}>
                        <span style={styles.timeBadgeIn}>{record.inTime}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.timeBadgeOut}>{record.outTime}</span>
                      </td>
                      <td style={styles.td}>
                        {record.photoUrl ? (
                          <a href={record.photoUrl} target="_blank" rel="noreferrer" style={styles.viewBtn}>
                            View Photo
                          </a>
                        ) : "—"}
                      </td>
                      <td style={styles.tdMuted}>
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

const styles = {
  pageWrapper: {
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px",
    boxSizing: "border-box",
    fontFamily: "'Inter', sans-serif",
    position: "absolute",
    left: 0,
    top: 0,
  },
  container: {
    width: "100%",
    maxWidth: "1100px", // Wider for data tables
    margin: "0 auto",
  },
  headerSection: {
    textAlign: "center",
    marginBottom: "40px",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: "0",
    top: "0",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    color: "#64748b",
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#1e293b",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#64748b",
    margin: 0,
    fontSize: "16px",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  tableResponsive: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    backgroundColor: "#f8fafc",
    padding: "18px 24px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #e2e8f0",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "20px 24px",
    fontSize: "15px",
    color: "#475569",
  },
  tdMuted: {
    padding: "20px 24px",
    fontSize: "13px",
    color: "#94a3b8",
  },
  timeBadgeIn: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "4px 10px",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "13px",
  },
  timeBadgeOut: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "4px 10px",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "13px",
  },
  viewBtn: {
    color: "#4f46e5",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
    borderBottom: "1px solid transparent",
    transition: "0.2s",
  },
  emptyState: {
    padding: "80px 20px",
    textAlign: "center",
    color: "#94a3b8",
  },
  loaderContainer: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loader: {
    fontSize: "18px",
    color: "#64748b",
    fontWeight: "500",
  }
};

export default EmployeeWorkReport;