import React from 'react'

export function PropertiesPanel({ element, onUpdate, onDelete }) {
  return (
    <div className="properties-panel">
      <h3>Properties</h3>

      <div className="prop-row">
        <div className="prop-group">
          <label>X</label>
          <input
            type="number"
            value={Math.round(element.x)}
            onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="prop-group">
          <label>Y</label>
          <input
            type="number"
            value={Math.round(element.y)}
            onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="prop-row">
        <div className="prop-group">
          <label>Width</label>
          <input
            type="number"
            value={Math.round(element.width)}
            onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 50 })}
          />
        </div>
        <div className="prop-group">
          <label>Height</label>
          <input
            type="number"
            value={Math.round(element.height)}
            onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 24 })}
          />
        </div>
      </div>

      {element.type === 'text' && (
        <>
          <div className="prop-group">
            <label>Style</label>
            <select
              value={element.style}
              onChange={(e) => onUpdate({ style: e.target.value })}
            >
              <option value="title">Title</option>
              <option value="subtitle">Subtitle</option>
              <option value="body">Body</option>
              <option value="label">Label</option>
            </select>
          </div>
        </>
      )}

      {element.type === 'deco' && (
        <>
          <div className="prop-group">
            <label>Color</label>
            <input
              type="color"
              value={element.color || '#1e3a5f'}
              onChange={(e) => onUpdate({ color: e.target.value })}
            />
          </div>
          <div className="prop-group">
            <label>Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={element.opacity ?? 1}
              onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
            />
          </div>
        </>
      )}

      {(element.type === 'photo' || element.type === 'logo') && element.src && (
        <div className="prop-group">
          <button
            className="sidebar-btn"
            onClick={() => onUpdate({ src: null })}
            style={{ marginTop: 8 }}
          >
            Replace Image
          </button>
        </div>
      )}

      {!element.locked && (
        <button className="delete-btn" onClick={onDelete}>
          Delete Element
        </button>
      )}
    </div>
  )
}
