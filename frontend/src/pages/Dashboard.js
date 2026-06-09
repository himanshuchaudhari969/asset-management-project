import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [assets, setAssets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assetsRes = await axios.get('https://asset-management-project-bmlf.onrender.com/api/assets', { headers });
        setAssets(assetsRes.data);
        if (user.role === 'admin') {
          const bookingsRes = await axios.get('https://asset-management-project-bmlf.onrender.com/api/bookings/all', { headers });
          setBookings(bookingsRes.data);
        } else {
          const bookingsRes = await axios.get('https://asset-management-project-bmlf.onrender.com/api/bookings/my', { headers });
          setBookings(bookingsRes.data);
        }
        const notifRes = await axios.get('https://asset-management-project-bmlf.onrender.com/api/notifications', { headers });
        setNotifications(notifRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const markRead = async () => {
    try {
      await axios.put('https://asset-management-project-bmlf.onrender.com/api/notifications/read', {}, { headers });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.navTitle}>Asset Management</h2>
        <div style={styles.navLinks}>
          <a href="/dashboard" style={styles.navLink}>Dashboard</a>
          <a href="/assets" style={styles.navLink}>Assets</a>
          <a href="/bookings" style={styles.navLink}>Bookings</a>
          {user?.role === 'admin' && <a href="/analytics" style={styles.navLink}>Analytics</a>}
          {user?.role === 'admin' && <a href="/audit" style={styles.navLink}>Audit Logs</a>}
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setShowNotif(!showNotif); if (!showNotif) markRead(); }} style={styles.bellBtn}>
              🔔 {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
            </button>
            {showNotif && (
              <div style={styles.notifDropdown}>
                <h4 style={{ margin: '0 0 10px 0' }}>Notifications</h4>
                {notifications.length === 0 ? (
                  <p style={{ color: '#999', fontSize: '13px' }}>Koi notification nahi</p>
                ) : (
                  notifications.slice(0, 8).map(n => (
                    <div key={n.id} style={{ ...styles.notifItem, backgroundColor: n.is_read ? 'white' : '#e8f0fe' }}>
                      <p style={{ margin: 0, fontSize: '13px' }}>{n.message}</p>
                      <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#999' }}>{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <h2>Welcome, {user?.name}! 👋</h2>
        <p style={styles.role}>Role: <strong>{user?.role}</strong></p>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <h3>{assets.length}</h3>
            <p>Total Assets</p>
          </div>
          <div style={styles.statCard}>
            <h3>{assets.filter(a => a.available > 0).length}</h3>
            <p>Available Assets</p>
          </div>
          <div style={styles.statCard}>
            <h3>{bookings.length}</h3>
            <p>{user?.role === 'admin' ? 'Total Bookings' : 'My Bookings'}</p>
          </div>
          <div style={styles.statCard}>
            <h3>{bookings.filter(b => b.status === 'pending').length}</h3>
            <p>Pending Bookings</p>
          </div>
          {user?.role === 'admin' && (
            <div style={{ ...styles.statCard, backgroundColor: '#fff3e0' }}>
              <h3 style={{ color: '#ff9800' }}>{bookings.filter(b => b.status === 'approved' && new Date(b.end_date) < new Date()).length}</h3>
              <p>Overdue Returns</p>
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <h3 style={{ marginTop: '30px' }}>Recent Bookings</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Asset</th>
              {user?.role === 'admin' && <th style={styles.th}>User</th>}
              <th style={styles.th}>Start Date</th>
              <th style={styles.th}>End Date</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.slice(0, 5).map(b => (
              <tr key={b.id}>
                <td style={styles.td}>{b.asset_name}</td>
                {user?.role === 'admin' && <td style={styles.td}>{b.user_name}</td>}
                <td style={styles.td}>{new Date(b.start_date).toLocaleDateString()}</td>
                <td style={styles.td}>{new Date(b.end_date).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.statusBadge, backgroundColor: b.status === 'approved' ? '#4caf50' : b.status === 'pending' ? '#ff9800' : b.status === 'returned' ? '#2196f3' : '#f44336' }}>
                    {b.status}
                  </span>
                </td>
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
  bellBtn: { backgroundColor: 'transparent', color: 'white', border: '1px solid white', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '15px', position: 'relative' },
  badge: { backgroundColor: '#f44336', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '11px', marginLeft: '4px' },
  notifDropdown: { position: 'absolute', right: 0, top: '40px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', width: '300px', padding: '15px', zIndex: 1000 },
  notifItem: { padding: '8px 10px', borderRadius: '5px', marginBottom: '5px', borderBottom: '1px solid #eee' },
  content: { padding: '30px' },
  role: { color: '#666', marginBottom: '20px' },
  statsRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  statCard: { backgroundColor: 'white', padding: '20px 30px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', minWidth: '150px' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  thead: { backgroundColor: '#1a73e8' },
  th: { padding: '12px 15px', color: 'white', textAlign: 'left' },
  td: { padding: '12px 15px', borderBottom: '1px solid #eee' },
  statusBadge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold' }
};

export default Dashboard;
