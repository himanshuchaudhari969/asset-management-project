import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('https://asset-management-project-bmlf.onrender.com/api/audit', { headers });
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLogs();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.navTitle}>Asset Management</h2>
        <div style={styles.navLinks}>
          <a href="/dashboard" style={styles.navLink}>Dashboard</a>
          <a href="/assets" style={styles.navLink}>Assets</a>
          <a href="/bookings" style={styles.navLink}>Bookings</a>
          <a href="/analytics" style={styles.navLink}>Analytics</a>
          <a href="/audit" style={styles.navLink}>Audit Logs</a>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <h2>Audit Logs</h2>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Time</th>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Action</th>
              <th style={styles.th}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td style={styles.td}>{new Date(log.created_at).toLocaleString()}</td>
                <td style={styles.td}>{log.user_name || 'System'}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: log.action.includes('DELETED') ? '#f44336' : log.action.includes('CREATED') ? '#4caf50' : '#1a73e8'
                  }}>
                    {log.action}
                  </span>
                </td>
                <td style={styles.td}>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f2f5' },
  navbar: { backgroundColor: '#1a73e8', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navTitle: { color: 'white', margin: 0 },
  navLinks: { display: 'flex', alignItems: 'center', gap: '20px' },
  navLink: { color: 'white', textDecoration: 'none', fontSize: '15px' },
  logoutBtn: { backgroundColor: 'white', color: '#1a73e8', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  content: { padding: '30px' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  thead: { backgroundColor: '#1a73e8' },
  th: { padding: '12px 15px', color: 'white', textAlign: 'left' },
  td: { padding: '12px 15px', borderBottom: '1px solid #eee', fontSize: '13px' },
  badge: { padding: '4px 8px', borderRadius: '20px', color: 'white', fontSize: '11px', fontWeight: 'bold' }
};

export default AuditLogs;
