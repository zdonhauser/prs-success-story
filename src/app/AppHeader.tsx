interface AppHeaderProps {
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  onClear: () => void
  onExport: () => void
  exporting: boolean
}

export function AppHeader({ sidebarCollapsed, onToggleSidebar, onClear, onExport, exporting }: AppHeaderProps) {
  return (
    <header className="app-header">
      <h1>
        PRS Success Story Builder
        <span className="app-version">v{__APP_VERSION__}</span>
      </h1>
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
