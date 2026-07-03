import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaPlaneDeparture,
  FaBars,
  FaChartPie,
  FaCloudUploadAlt,
  FaYoutube,
  FaCommentDots,
  FaStar,
  FaCalendarAlt,
  FaBullseye,
  FaHistory,
  FaTools,
  FaUserCircle,
} from 'react-icons/fa';

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  const navClass = (path) =>
    location.pathname === path ? 'nav-link active' : 'nav-link';

  const adminVisible = typeof isAdmin === 'function' && isAdmin();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">
          <FaPlaneDeparture /> StudyPilot AI
        </Link>
      </div>

      <button
        className="hamburger"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        <FaBars />
      </button>

      <div className={`navbar-menu${menuOpen ? ' open' : ''}`}>
        <Link className={navClass('/dashboard')} to="/dashboard" onClick={closeMenu}>
          <FaChartPie /> Dashboard
        </Link>
        <Link className={navClass('/upload')} to="/upload" onClick={closeMenu}>
          <FaCloudUploadAlt /> Upload
        </Link>
        <Link className={navClass('/youtube')} to="/youtube" onClick={closeMenu}>
          <FaYoutube /> YouTube
        </Link>
        <Link className={navClass('/chat')} to="/chat" onClick={closeMenu}>
          <FaCommentDots /> Chat
        </Link>
        <Link className={navClass('/favorites')} to="/favorites" onClick={closeMenu}>
          <FaStar /> Favorites
        </Link>
        <Link className={navClass('/study-planner')} to="/study-planner" onClick={closeMenu}>
          <FaCalendarAlt /> Planner
        </Link>
        <Link className={navClass('/quiz-history')} to="/quiz-history" onClick={closeMenu}>
          <FaBullseye /> Quizzes
        </Link>
        <Link className={navClass('/history')} to="/history" onClick={closeMenu}>
          <FaHistory /> History
        </Link>

        {adminVisible && (
          <Link className={navClass('/admin')} to="/admin" onClick={closeMenu}>
            <FaTools /> Admin
          </Link>
        )}

        <Link className={navClass('/profile')} to="/profile" onClick={closeMenu}>
          <FaUserCircle /> {user?.username}
        </Link>

        <button className="btn btn-outline-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
