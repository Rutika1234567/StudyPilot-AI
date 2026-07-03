import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/UIComponents';
import { FaPlaneDeparture } from 'react-icons/fa';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("Submit clicked");
  console.log("Username:", username);
  console.log("Password:", password);

  setError("");
  setLoading(true);

  try {
    console.log("Calling API...");

    const res = await authAPI.login({
      username,
      password,
    });

    console.log("Response:", res);

    login(res.data.data);
    navigate("/dashboard");
  } catch (err) {
    console.log("ERROR:", err);
    console.log("Message:", err.message);
    console.log("Response:", err.response);

    setError(err.response?.data?.message || err.message);
  } finally {
    console.log("Finished");
    setLoading(false);
  }
};

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand-icon"><FaPlaneDeparture /></div>
        <h1 className="auth-title">StudyPilot AI</h1>
        <p className="auth-subtitle">
          AI-Powered Learning, Assessment &amp; Study Management
        </p>

        <Alert type="error" message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;