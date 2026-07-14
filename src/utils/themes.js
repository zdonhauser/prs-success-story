export const themes = [
  { id: 'classic',    name: 'Classic Blue' },
  { id: 'navy-gold',  name: 'Navy & Gold' },
  { id: 'teal-fresh', name: 'Teal Fresh' },
  { id: 'warm-earth', name: 'Warm Earth' },
  { id: 'bold-red',   name: 'Bold Red' },
  { id: 'forest',     name: 'Forest' },
  { id: 'slate-pro',  name: 'Slate Pro' },
  { id: 'sunrise',    name: 'Sunrise' },
  { id: 'minimal',    name: 'Minimal' },
  { id: 'prs-vibrant',name: 'PRS Vibrant' },
]

// Swatch colors for the theme picker UI (primary, accent)
export const themeSwatch = {
  'classic':    ['#2056a0', '#e8c96a'],
  'navy-gold':  ['#1a2d4f', '#c9a84c'],
  'teal-fresh': ['#1898c0', '#e8c96a'],
  'warm-earth': ['#8b6850', '#e09040'],
  'bold-red':   ['#e04830', '#2056a0'],
  'forest':     ['#1b4332', '#52b788'],
  'slate-pro':  ['#334155', '#2056a0'],
  'sunrise':    ['#c2410c', '#fbbf24'],
  'minimal':    ['#94a3b8', '#e2e8f0'],
  'prs-vibrant':['#2056a0', '#e04830'],
}

// Logo variant behind each theme's header. Themes with a solid dark
// header band need the white cutout; themes with a plain white header
// area use the color mark, except the flatter/more subdued themes
// (Slate Pro, Minimal) which read cleaner with the black mark.
export const themeLogo = {
  'classic':     'white',
  'navy-gold':   'white',
  'teal-fresh':  'color',
  'warm-earth':  'color',
  'bold-red':    'color',
  'forest':      'white',
  'slate-pro':   'black',
  'sunrise':     'color',
  'minimal':     'black',
  'prs-vibrant': 'color',
}

export const logoSrc = {
  color: './logo-color.png',
  black: './logo-black.png',
  white: './logo-white.png',
}
