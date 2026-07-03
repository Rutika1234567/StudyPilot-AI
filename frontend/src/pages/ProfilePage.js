import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { userAPI } from '../services/api';
import { Card, Loader, Alert } from '../components/UIComponents';
import { FaEnvelope } from 'react-icons/fa';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const [fullName, setFullName] = useState('');
  const [bio, setBio]           = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      setProfile(res.data.data);
      setFullName(res.data.data.fullName || '');
      setBio(res.data.data.bio || '');
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await userAPI.updateProfile({ fullName, bio });
      setProfile(res.data.data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

if (loading) {
  return (
    <Layout title="Profile">
      <Loader />
    </Layout>
  );
}

if (!profile) {
  return (
    <Layout title="Profile">
      <Alert
        type="error"
        message={error || "Unable to load profile."}
      />
    </Layout>
  );
}
  return (
    <Layout title="My Profile">
      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <Card className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
{profile.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h2>{profile.username || "Unknown User"}</h2>
            <p className="text-muted">{profile.email ? (<><FaEnvelope /> {profile.email}</>) : "-"}</p>
            <div className="role-badges">
              {(profile.roles || []).map((role) => (
                <span key={role} className="badge">
                  {role.replace('ROLE_', '')}
                </span>
              ))}
            </div>
          </div>
        </div>

        <hr />

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <p className="text-muted">
            Member since: {profile.createdAt
              ? new Date(profile.createdAt).toLocaleDateString()
              : "-"}
          </p>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </Card>
    </Layout>
  );
}

export default ProfilePage;