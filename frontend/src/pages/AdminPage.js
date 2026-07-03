import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { adminAPI } from '../services/api';
import { Card, Loader, Alert, EmptyState } from '../components/UIComponents';
import { FaUsers, FaFileAlt, FaTrashAlt } from 'react-icons/fa';

function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers]         = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'users') {
        const res = await adminAPI.getAllUsers();
        setUsers(res.data.data);
      } else {
        const res = await adminAPI.getAllDocuments();
        setDocuments(res.data.data);
      }
    } catch (err) {
      setError('Failed to load data. Make sure you have ADMIN role.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      setSuccess(`User "${username}" deleted`);
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  return (
    <Layout title="Admin Panel">
      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'users' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FaUsers /> Users
        </button>
        <button
          className={`tab ${activeTab === 'documents' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FaFileAlt /> All Documents
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : activeTab === 'users' ? (
        <Card>
          <h3 className="card-title">All Registered Users ({users.length})</h3>
          {users.length === 0 ? (
            <EmptyState text="No users found" />
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Full Name</th>
                    <th>Roles</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.fullName || '-'}</td>
                      <td>
                        {u.roles.map((r) => (
                          <span key={r} className="badge">{r.replace('ROLE_', '')}</span>
                        ))}
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteUser(u.id, u.username)}
                        >
                          <FaTrashAlt /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <h3 className="card-title">All Uploaded Documents ({documents.length})</h3>
          {documents.length === 0 ? (
            <EmptyState text="No documents found" />
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.id}</td>
                      <td>{doc.originalName}</td>
                      <td>{doc.fileType}</td>
                      <td>{(doc.fileSize / 1024).toFixed(1)} KB</td>
                      <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </Layout>
  );
}

export default AdminPage;
