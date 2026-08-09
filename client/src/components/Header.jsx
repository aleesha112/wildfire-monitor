function Header({ totalFires, lastUpdated, user, onLogout, onGoHome, onToggleSidebar }) {
  return (
    <header className="app-header">
      <button className="sidebar-toggle-btn" onClick={onToggleSidebar}>☰</button>
      <div className="header-left" onClick={onGoHome} style={{ cursor: 'pointer' }}>
        <span className="live-dot"></span>
        <h1>WILDFIRE<span className="accent">MONITOR</span></h1>
      </div>
      <div className="header-right">
        <span className="header-label">SOURCE</span>
        <span className="header-value">NASA VIIRS</span>
        <span className="divider">|</span>
        <span className="header-label">LAST SYNC</span>
        <span className="header-value">{lastUpdated || '—'}</span>
        <span className="divider">|</span>
        <span className="header-value">{user?.name}</span>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}

export default Header;