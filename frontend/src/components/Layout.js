import React from 'react';
import Navbar from './Navbar';

/**
 * Layout wraps every protected page with:
 *   - Sticky Navbar at the top
 *   - Centred content area
 *   - Optional page heading (the `title` prop)
 *
 * Usage:
 *   <Layout title="Dashboard">
 *     <YourPageContent />
 *   </Layout>
 */
function Layout({ children, title }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        {title && <h1 className="page-title">{title}</h1>}
        {children}
      </main>
    </div>
  );
}

export default Layout;
