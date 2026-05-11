import React from 'react'

export function Sidebar({ onAdd }) {
  return (
    <div className="sidebar">
      <h3>Add Elements</h3>

      <button className="sidebar-btn" onClick={() => onAdd('photo')}>
        <span className="icon">📷</span>
        <span>Photo</span>
      </button>

      <button className="sidebar-btn" onClick={() => onAdd('title')}>
        <span className="icon">H</span>
        <span>Title Text</span>
      </button>

      <button className="sidebar-btn" onClick={() => onAdd('subtitle')}>
        <span className="icon">h</span>
        <span>Subtitle Text</span>
      </button>

      <button className="sidebar-btn" onClick={() => onAdd('body')}>
        <span className="icon">¶</span>
        <span>Body Text</span>
      </button>

      <button className="sidebar-btn" onClick={() => onAdd('label')}>
        <span className="icon">A</span>
        <span>Label</span>
      </button>

      <h3>Decorative</h3>

      <button className="sidebar-btn" onClick={() => onAdd('divider')}>
        <span className="icon">—</span>
        <span>Divider Line</span>
      </button>

      <button className="sidebar-btn" onClick={() => onAdd('rect')}>
        <span className="icon">▢</span>
        <span>Color Block</span>
      </button>

      <h3>Tips</h3>
      <p style={{ fontSize: '12px', color: '#718096', lineHeight: 1.5 }}>
        Drag elements to reposition. Resize from bottom-right corner.
        Click text to edit. Drop images onto photo areas.
        Press Delete to remove selected element.
      </p>
    </div>
  )
}
