import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', quantity: '', description: '' });
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [qrAsset, setQrAsset] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchAssets();
  }, [search, categoryFilter]);

  const fetchAssets = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      const res = await axios.get('https://asset-management-project-bmlf.onrender.com/api/assets', { headers, params });
      setAssets(res.data);
      const cats = [...new Set(res.data.map(a => a.category).filter(Boolean))];
      setCategories(cats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://asset-management-project-bmlf.onrender.com/api/assets', form, { headers });
      setForm({ name: '', category: '', quantity: '', description: '' });
      setShowForm(false);
      fetchAssets();
    } catch (err) {
      alert('Asset create karne mein error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Asset delete karna chahte ho?')) {
      try {
        await axios.delete(`https://asset-management-project-bmlf.onrender.com/api/assets/${id}`, { headers });
        fetchAssets();
      } catch (err) {
        alert('Delete karne mein error');
      }
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
          {user?.role === 'admin' && <a href="/analytics" style={styles.navLink}>Analytics</a>}
          {user?.role === 'admin' && <a href="/audit" style={styles.navLink}>Audit Logs</a>}
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.header}>
          <h2>Assets</h2>
          {user?.role === 'admin' && (
            <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '+ Add Asset'}
            </button>
          )}
        </div>

        {/* Search & Filter */}
        <div style={styles.filterRow}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="🔍 Search assets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select style={styles.select} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {(search || categoryFilter) && (
            <button style={styles.clearBtn} onClick={() => { setSearch(''); setCategoryFilter(''); }}>
              Clear
            </button>
          )}
        </div>

        {/* Add Asset Form */}
        {showForm && (
          <div style={styles.formBox}>
            <h3>Naya Asset Add Karo</h3>
            <form onSubmit={handleCreate}>
              <input style={styles.input} type="text" name="name" placeholder="Asset Name" value={form.name} onChange={handleChange} required />
              <input style={styles.input} type="text" name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
              <input style={styles.input} type="number" name="quantity" placeholder="Quantity" value={form.quantity} onChange={handleChange} required />
              <input style={styles.input} type="text" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
              <button style={styles.submitBtn} type="submit">Add Asset</button>
            </form>
          </div>
        )}

        {/* QR Code Modal */}
        {qrAsset && (
          <div style={styles.qrModal}>
            <div style={styles.qrBox}>
              <h3>QR Code — {qrAsset.name}</h3>
              <QRCode value={`Asset ID: ${qrAsset.id} | Name: ${qrAsset.name} | Category: ${qrAsset.category}`} size={200} />
              <p style={{ marginTop: '10px', color: '#666', fontSize: '13px' }}>Asset ID: {qrAsset.id}</p>
              <button style={styles.closeBtn} onClick={() => setQrAsset(null)}>Close</button>
            </div>
          </div>
        )}

        {/* Assets Table */}
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Available</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>QR</th>
              {user?.role === 'admin' && <th style={styles.th}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {assets.map(a => (
              <tr key={a.id}>
                <td style={styles.td}>{a.name}</td>
                <td style={styles.td}>{a.category}</td>
                <td style={styles.td}>{a.quantity}</td>
                <td style={styles.td}>
                  <span style={{ color: a.available > 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                    {a.available}
                  </span>
                </td>
                <td style={styles.td}>{a.description}</td>
                <td style={styles.td}>
                  <button onClick={() => setQrAsset(a)} style={styles.qrBtn}>QR</button>
                </td>
                {user?.role === 'admin' && (
                  <td style={styles.td}>
                    <button onClick={() => handleDelete(a.id)} style={styles.deleteBtn}>Delete</button>
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
  filterRow: { display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' },
  searchInput: { padding: '10px 15px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px', width: '300px' },
  select: { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' },
  clearBtn: { padding: '10px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  addBtn: { backgroundColor: '#1a73e8', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '15px' },
  formBox: { backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' },
  input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' },
  submitBtn: { backgroundColor: '#1a73e8', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '15px' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  thead: { backgroundColor: '#1a73e8' },
  th: { padding: '12px 15px', color: 'white', textAlign: 'left' },
  td: { padding: '12px 15px', borderBottom: '1px solid #eee' },
  deleteBtn: { backgroundColor: '#f44336', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer' },
  qrBtn: { backgroundColor: '#9c27b0', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer' },
  qrModal: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  qrBox: { backgroundColor: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center' },
  closeBtn: { marginTop: '15px', padding: '8px 20px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default Assets; 
