// Default template elements matching PRS Success Story layout
// Canvas is 816x1056 (8.5x11 at 96dpi)

export const defaultElements = [
  // Logo placeholder (top center)
  {
    id: 'logo',
    type: 'logo',
    x: 258,
    y: 20,
    width: 300,
    height: 80,
    src: null, // Will use built-in placeholder until user uploads
    locked: false
  },
  // Title
  {
    id: 'title',
    type: 'text',
    x: 108,
    y: 115,
    width: 600,
    height: 38,
    text: 'Good Neighbor Program Success Story',
    style: 'title',
    locked: false
  },
  // Divider line under title
  {
    id: 'divider1',
    type: 'deco',
    x: 108,
    y: 155,
    width: 600,
    height: 3,
    color: '#1e3a5f',
    locked: false
  },
  // Community name label
  {
    id: 'lbl_community',
    type: 'text',
    x: 108,
    y: 170,
    width: 150,
    height: 20,
    text: 'COMMUNITY',
    style: 'label',
    locked: false
  },
  // Community name value
  {
    id: 'val_community',
    type: 'text',
    x: 108,
    y: 188,
    width: 200,
    height: 26,
    text: 'Community Name',
    style: 'subtitle',
    locked: false
  },
  // Coordinator label
  {
    id: 'lbl_coordinator',
    type: 'text',
    x: 340,
    y: 170,
    width: 150,
    height: 20,
    text: 'COORDINATOR',
    style: 'label',
    locked: false
  },
  // Coordinator value
  {
    id: 'val_coordinator',
    type: 'text',
    x: 340,
    y: 188,
    width: 200,
    height: 26,
    text: 'Coordinator Name',
    style: 'subtitle',
    locked: false
  },
  // Date label
  {
    id: 'lbl_date',
    type: 'text',
    x: 580,
    y: 170,
    width: 120,
    height: 20,
    text: 'DATE',
    style: 'label',
    locked: false
  },
  // Date value
  {
    id: 'val_date',
    type: 'text',
    x: 580,
    y: 188,
    width: 130,
    height: 26,
    text: 'Month Year',
    style: 'subtitle',
    locked: false
  },
  // Photo 1 (large, left)
  {
    id: 'photo1',
    type: 'photo',
    x: 108,
    y: 230,
    width: 340,
    height: 260,
    src: null
  },
  // Photo 2 (top right)
  {
    id: 'photo2',
    type: 'photo',
    x: 460,
    y: 230,
    width: 248,
    height: 125,
    src: null
  },
  // Photo 3 (bottom right)
  {
    id: 'photo3',
    type: 'photo',
    x: 460,
    y: 365,
    width: 248,
    height: 125,
    src: null
  },
  // Photo 4 (small, optional)
  {
    id: 'photo4',
    type: 'photo',
    x: 108,
    y: 500,
    width: 150,
    height: 110,
    src: null
  },
  // Narrative label
  {
    id: 'lbl_narrative',
    type: 'text',
    x: 108,
    y: 625,
    width: 150,
    height: 20,
    text: 'NARRATIVE',
    style: 'label',
    locked: false
  },
  // Narrative body
  {
    id: 'narrative',
    type: 'text',
    x: 108,
    y: 648,
    width: 600,
    height: 340,
    text: 'Describe the event or activity here. What happened? Who was involved? What was the impact on the community? Share the story of how this Good Neighbor Program activity made a difference.',
    style: 'body',
    locked: false
  },
  // Bottom accent bar
  {
    id: 'bottom_bar',
    type: 'deco',
    x: 0,
    y: 1040,
    width: 816,
    height: 16,
    color: '#1e3a5f',
    locked: false
  }
]
