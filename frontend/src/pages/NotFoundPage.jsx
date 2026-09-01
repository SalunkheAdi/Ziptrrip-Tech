import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔍</div>
      <h1 style={{ fontSize: '2rem', marginBottom: 8, color: 'var(--gray-900)' }}>404 — Page Not Found</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>
        The page you're looking for doesn't exist.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/todos')}>
        ← Go to Todos
      </button>
    </div>
  );
}

export default NotFoundPage;
