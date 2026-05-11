import React from 'react'

export function ExportModal() {
  return (
    <div className="export-overlay">
      <div className="export-modal">
        <h2>Generating PDF</h2>
        <div className="spinner" />
        <p>Rendering your success story at print quality...</p>
      </div>
    </div>
  )
}
