export function AppHeader({ sidebarCollapsed, onToggleSidebar, onClear, onExport, exporting }) {
  return (
    <header className="app-header">
      <h1>PRS Success Story Builder</h1>
      <div className="app-header-actions">
        <button className="btn-header-ghost" onClick={onToggleSidebar}>
          {sidebarCollapsed ? '☰ Show Form' : '✕ Hide Form'}
        </button>
        <button className="btn-header-ghost" onClick={onClear}>Clear</button>
        <button className="btn-download" onClick={onExport} disabled={exporting}>
          {exporting ? 'Generating…' : '↓ Download PDF'}
        </button>
      </div>
    </header>
  )
}
