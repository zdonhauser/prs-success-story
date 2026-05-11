import React, { useState } from 'react'

export function MobileControls({ onAdd, onExport }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <div className="fab-container">
        {menuOpen && (
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            marginBottom: 8,
            minWidth: 160
          }}>
            <MobileMenuItem label="Photo" onClick={() => { onAdd('photo'); setMenuOpen(false) }} />
            <MobileMenuItem label="Title" onClick={() => { onAdd('title'); setMenuOpen(false) }} />
            <MobileMenuItem label="Body Text" onClick={() => { onAdd('body'); setMenuOpen(false) }} />
            <MobileMenuItem label="Label" onClick={() => { onAdd('label'); setMenuOpen(false) }} />
            <MobileMenuItem label="Divider" onClick={() => { onAdd('divider'); setMenuOpen(false) }} />
          </div>
        )}
        <button className="fab" onClick={() => setMenuOpen(!menuOpen)}>+</button>
        <button className="fab gold" onClick={onExport}>↓</button>
      </div>
    </>
  )
}

function MobileMenuItem({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        padding: '10px 12px',
        border: 'none',
        background: 'none',
        textAlign: 'left',
        fontSize: 14,
        cursor: 'pointer',
        borderRadius: 6
      }}
    >
      {label}
    </button>
  )
}
