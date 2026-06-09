import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

const COLORS = ['#1a73e8', '#4caf50', '#ff9800', '#f44336', '#9c27b0'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('https://asset-management-project-bmlf.onrender.com/api/analytics', { headers });
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnalytics();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!data) return <div style={{ padding: '30px' }}>Loading...</div>;

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
        <h2>Analytics Dashboard</h2>

        {/* Overdue Returns */}
        {data.overdue.length > 0 && (
          <div style={styles.overdueBox}>
            <h3>⚠️ Overdue Returns ({data.overdue.length})</h3>
            {data.overdue.map(o => (
              <p key={o.id} style={{ margin: '5px 0' }}>
                <strong>{o.asset_name}</strong> — {o.user_name} (Due: {new Date(o.end_date).toLocaleDateString()})
              </p>
            ))}
          </div>
        )}

        <div style={styles.chartsRow}>
          {/* Most Used Assets - Bar Chart */}
          <div style={styles.chartBox}>
            <h3>Most Used Assets</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.mostUsed}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="booking_count" fill="#1a73e8" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Booking Status - Pie Chart */}
          <div style={styles.chartBox}>
            <h3>Booking Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.statusDist} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}>
                  {data.statusDist.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Bookings - Line Chart */}
        <div style={styles.chartBoxFull}>
          <h3>Monthly Bookings (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.monthlyBookings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#1a73e8" name="Bookings" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Utilization */}
        <div style={styles.chartBoxFull}>
          <h3>Asset Utilization Rate</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.utilization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis unit="%" />
              <Tooltip formatter={(val) => `${val}%`} />
              <Bar dataKey="utilization_rate" fill="#4caf50" name="Utilization %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
  overdueBox: { backgroundColor: '#fff3e0', border: '1px solid #ff9800', borderRadius: '10px', padding: '15px 20px', marginBottom: '20px' },
  chartsRow: { display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' },
  chartBox: { backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flex: 1, minWidth: '300px' },
  chartBoxFull: { backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' },
};

export default Analytics; 
