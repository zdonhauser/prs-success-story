import React, { forwardRef, useEffect, useRef } from 'react'
import interact from 'interactjs'

export const Canvas = forwardRef(({ elements, selectedId, onSelect, onUpdate }, ref) => {
  return (
    <div
      ref={ref}
      className="canvas"
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelect(null)
      }}
    >
      {elements.map(el => (
        <CanvasElement
          key={el.id}
          element={el}
          isSelected={el.id === selectedId}
          onSelect={() => onSelect(el.id)}
          onUpdate={(updates) => onUpdate(el.id, updates)}
        />
      ))}
    </div>
  )
})

Canvas.displayName = 'Canvas'

function CanvasElement({ element, isSelected, onSelect, onUpdate }) {
  const elRef = useRef(null)
  const interactRef = useRef(null)

  useEffect(() => {
    if (!elRef.current) return

    const el = elRef.current

    interactRef.current = interact(el)
      .draggable({
        inertia: false,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: false
          })
        ],
        listeners: {
          move(event) {
            const x = element.x + event.dx
            const y = element.y + event.dy
            onUpdate({ x: Math.round(x), y: Math.round(y) })
          }
        }
      })
      .resizable({
        edges: { left: false, right: true, bottom: true, top: false },
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: 50, height: 24 }
          })
        ],
        listeners: {
          move(event) {
            onUpdate({
              width: Math.round(event.rect.width),
              height: Math.round(event.rect.height)
            })
          }
        }
      })

    return () => {
      if (interactRef.current) {
        interactRef.current.unset()
      }
    }
  }, [element.x, element.y])

  const style = {
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height
  }

  const handleClick = (e) => {
    e.stopPropagation()
    onSelect()
  }

  return (
    <div
      ref={elRef}
      className={`canvas-element ${isSelected ? 'selected' : ''}`}
      style={style}
      onClick={handleClick}
    >
      <ElementContent element={element} onUpdate={onUpdate} isSelected={isSelected} />
      {isSelected && (
        <>
          <div className="resize-handle se" />
        </>
      )}
    </div>
  )
}

function ElementContent({ element, onUpdate, isSelected }) {
  switch (element.type) {
    case 'photo':
      return <PhotoContent element={element} onUpdate={onUpdate} />
    case 'text':
      return <TextContent element={element} onUpdate={onUpdate} isSelected={isSelected} />
    case 'logo':
      return <LogoContent element={element} onUpdate={onUpdate} />
    case 'deco':
      return <DecoContent element={element} />
    default:
      return null
  }
}

function PhotoContent({ element, onUpdate }) {
  const fileRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onUpdate({ src: ev.target.result })
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onUpdate({ src: ev.target.result })
    }
    reader.readAsDataURL(file)
  }

  if (element.src) {
    return (
      <div className="photo-element" style={{ width: '100%', height: '100%' }}>
        <img src={element.src} alt="" draggable={false} />
      </div>
    )
  }

  return (
    <div
      className="photo-element"
      style={{ width: '100%', height: '100%' }}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}
    >
      <div className="photo-placeholder">
        <div className="icon">📷</div>
        <p>Tap or drop photo</p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  )
}

function TextContent({ element, onUpdate, isSelected }) {
  const textRef = useRef(null)

  const handleBlur = () => {
    if (textRef.current) {
      onUpdate({ text: textRef.current.innerText })
    }
  }

  return (
    <div
      ref={textRef}
      className={`text-element ${element.style}`}
      contentEditable={isSelected}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onMouseDown={(e) => {
        if (isSelected) e.stopPropagation()
      }}
      dangerouslySetInnerHTML={{ __html: element.text }}
    />
  )
}

function LogoContent({ element, onUpdate }) {
  const fileRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onUpdate({ src: ev.target.result })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      className="logo-element"
      style={{ width: '100%', height: '100%' }}
      onClick={(e) => { if (!element.src) { e.stopPropagation(); fileRef.current?.click() }}}
    >
      {element.src ? (
        <img src={element.src} alt="Logo" draggable={false} />
      ) : (
        <div className="photo-placeholder">
          <div className="icon">🏢</div>
          <p>Upload logo</p>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  )
}

function DecoContent({ element }) {
  return (
    <div
      className="deco-element"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: element.color || '#1e3a5f',
        opacity: element.opacity ?? 1
      }}
    />
  )
}
