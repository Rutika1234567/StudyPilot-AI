import React, { useState, useEffect } from 'react';
import {
  FaRegStar,
  FaStar,
  FaFilePdf,
  FaInbox,
  FaCircleNotch,
} from 'react-icons/fa';

/**
 * Shared UI components used across every page.
 *
 * Exports:
 *   Card, Loader, Alert, StatCard, EmptyState
 *   FavoriteButton   ← used by DocumentPage
 *   ExportPdfButton  ← used by DocumentPage
 */

// ─────────────────────────────────────────────
// Card — white rounded container
// ─────────────────────────────────────────────
export function Card({ children, className, style }) {
  const classes = ['card', className].filter(Boolean).join(' ');
  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// Loader — spinner + optional message
// ─────────────────────────────────────────────
export function Loader({ text }) {
  return (
    <div className="loader-wrap">
      <div className="spinner" />
      <p className="loader-text">{text || 'Loading...'}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Alert — coloured message bar
// type: 'success' | 'error' | 'info'
// Renders nothing when message is empty/null.
// ─────────────────────────────────────────────
export function Alert({ type, message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type || 'info'}`}>
      <span>{message}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// StatCard — metric tile used on Dashboard
// ─────────────────────────────────────────────
export function StatCard({ icon, label, value, color }) {
  return (
    <div
      className="stat-card"
      style={color ? { borderTopColor: color } : {}}
    >
      <div
        className="stat-icon"
        style={color ? { background: color + '18', color } : {}}
      >
        {icon}
      </div>
      <div>
        <div className="stat-value" style={color ? { color } : {}}>
          {value}
        </div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// EmptyState — friendly placeholder
// ─────────────────────────────────────────────
export function EmptyState({ icon, text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon || <FaInbox />}</div>
      <p>{text}</p>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────
// FavoriteButton
// Used in DocumentPage to save generated AI content.
//
// Props:
//   contentType    – 'SUMMARY' | 'NOTE' | 'MCQ' | 'FLASHCARD' |
//                   'INTERVIEW_QUESTION' | 'IMPORTANT_QUESTION'
//   contentId      – DB id of the generated content record
//   title          – display label saved with the favorite
//   contentPreview – first chars of the AI text
//   favoriteAPI    – the favoriteAPI object from services/api.js
// ─────────────────────────────────────────────
export function FavoriteButton({
  contentType,
  contentId,
  title,
  contentPreview,
  favoriteAPI,
}) {
  const [saved, setSaved]       = useState(false);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving]     = useState(false);

  // Check on mount whether this item is already saved
  useEffect(() => {
    if (!contentId || !favoriteAPI) {
      setChecking(false);
      return;
    }
    favoriteAPI
      .check(contentType, contentId)
      .then((res) => setSaved(!!res.data?.data))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [contentType, contentId, favoriteAPI]);

  const handleClick = async () => {
    if (saved || saving || checking) return;
    setSaving(true);
    try {
      await favoriteAPI.add({
        contentType,
        contentId,
        title,
        contentPreview: contentPreview
          ? contentPreview.substring(0, 500)
          : '',
      });
      setSaved(true);
    } catch {
      // silent fail — user can try again
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={saved || saving || checking}
      className={`pill-btn${saved ? ' saved' : ''}`}
    >
      {checking || saving ? (
        <FaCircleNotch className="icon" style={{ animation: 'spin 0.7s linear infinite' }} />
      ) : saved ? (
        <FaStar className="icon" />
      ) : (
        <FaRegStar className="icon" />
      )}
      {checking || saving ? '...' : saved ? 'Saved' : 'Save'}
    </button>
  );
}

// ─────────────────────────────────────────────
// ExportPdfButton
// Used in DocumentPage to download AI content as PDF.
//
// Props:
//   onExport – async function called on click
//   loading  – true while the PDF is being generated
//   label    – button text (default: 'Export PDF')
// ─────────────────────────────────────────────
export function ExportPdfButton({ onExport, loading, label }) {
  return (
    <button
      onClick={onExport}
      disabled={loading}
      className="pill-btn export"
    >
      {loading ? (
        <FaCircleNotch className="icon" style={{ animation: 'spin 0.7s linear infinite' }} />
      ) : (
        <FaFilePdf className="icon" />
      )}
      {loading ? 'Exporting...' : (label || 'Export PDF')}
    </button>
  );
}
