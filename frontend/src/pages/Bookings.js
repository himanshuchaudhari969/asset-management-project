import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({ asset_id: '', start_date: '', end_date: '', reason: '' });
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchBookings();
    fetchAssets();
  }, []);

  const fetchBookings = async () => {
    try {
      const url = user?.role === 'admin'
        ? 'https://asset-management-project-bmlf.onrender.com/api/bookings/all'
        : 'https://asset-management-project-bmlf.onrender.com/api/bookings/my';
      const res = await axios.get(url, { headers });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await axios.get('https://asset-management-project-bmlf.onrender.com/api/assets', { headers });
      setAssets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://asset-management-project-bmlf.onrender.com/api/bookings', form, { headers });
      setForm({ asset_id: '', start_date: '', end_date: '', reason: '' });
      setShowForm(false);
      fetchBookings();
    } catch (err) {
      alert('Booking karne mein error: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`https://asset-management-project-bmlf.onrender.com/api/bookings/${id}/status`, { status }, { headers });
      fetchBookings();
    } catch (err) {
      alert('Status update mein error');
    }
  };

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
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.header}>
          <h2>{user?.role === 'admin' ? 'All Bookings' : 'My Bookings'}</h2>
          {user?.role !== 'admin' && (
            <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '+ New Booking'}
            </button>
          )}
        </div>

        {/* New Booking Form */}
        {showForm && (
          <div style={styles.formBox}>
            <h3>Asset Book Karo</h3>
            <form onSubmit={handleBooking}>
              <select style={styles.input} name="asset_id" value={form.asset_id} onChange={handleChange} required>
                <option value="">Asset Select Karo</option>
                {assets.filter(a => a.available > 0).map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.category}) - {a.available} available</option>
                ))}
              </select>
              <input style={styles.input} type="date" name="start_date" value={form.start_date} onChange={handleChange} required />
              <input style={styles.input} type="date" name="end_date" value={form.end_date} onChange={handleChange} required />
              <input style={styles.input} type="text" name="reason" placeholder="Reason (optional)" value={form.reason} onChange={handleChange} />
              <button style={styles.submitBtn} type="submit">Book Now</button>
            </form>
          </div>
        )}

        {/* Bookings Table */}
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Asset</th>
              {user?.role === 'admin' && <th style={styles.th}>User</th>}
              <th style={styles.th}>Start Date</th>
              <th style={styles.th}>End Date</th>
              <th style={styles.th}>Reason</th>
              <th style={styles.th}>Status</th>
              {user?.role === 'admin' && <th style={styles.th}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td style={styles.td}>{b.asset_name}</td>
                {user?.role === 'admin' && <td style={styles.td}>{b.user_name}</td>}
                <td style={styles.td}>{new Date(b.start_date).toLocaleDateString()}</td>
                <td style={styles.td}>{new Date(b.end_date).toLocaleDateString()}</td>
                <td style={styles.td}>{b.reason || '-'}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, backgroundColor: b.status === 'approved' ? '#4caf50' : b.status === 'pending' ? '#ff9800' : b.status === 'returned' ? '#2196f3' : '#f44336' }}>
                    {b.status}
                  </span>
                </td>
                {user?.role === 'admin' && (
                  <td style={styles.td}>
                    {b.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatusUpdate(b.id, 'approved')} style={styles.approveBtn}>Approve</button>
                        <button onClick={() => handleStatusUpdate(b.id, 'rejected')} style={styles.rejectBtn}>Reject</button>
                      </>
                    )}
                    {b.status === 'approved' && (
                      <button onClick={() => handleStatusUpdate(b.id, 'returned')} style={styles.returnBtn}>Returned</button>
                    )}
                  </td>
                )}
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  addBtn: { backgroundColor: '#1a73e8', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '15px' },
  formBox: { backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' },
  input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' },
  submitBtn: { backgroundColor: '#1a73e8', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '15px' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  thead: { backgroundColor: '#1a73e8' },
  th: { padding: '12px 15px', color: 'white', textAlign: 'left' },
  td: { padding: '12px 15px', borderBottom: '1px solid #eee' },
  badge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold' },
  approveBtn: { backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '5px', cursor: 'pointer', marginRight: '5px' },
  rejectBtn: { backgroundColor: '#f44336', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '5px', cursor: 'pointer' },
  returnBtn: { backgroundColor: '#2196f3', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '5px', cursor: 'pointer' }
};

export default Bookings;
