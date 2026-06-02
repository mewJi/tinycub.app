// icons.jsx — TinyCub icon set (stroke icons, 24x24, currentColor)
const ICON_PATHS = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9.5V20a1 1 0 0 0 1 1H10v-5.5h4V21h3.5a1 1 0 0 0 1-1V9.5',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  sparkles: 'M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16 10.2 11.3 5.5 9.5l4.7-1.8zM18.5 14l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9zM5.5 14l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8L3 16.5l1.8-.7z',
  bell: 'M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5zM9.5 19a2.5 2.5 0 0 0 5 0',
  plus: 'M12 5v14M5 12h14',
  back: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7',
  check: 'M5 12.5l4.5 4.5L19 7',
  image: 'M4 5h16v14H4zM4 16l4.5-4.5 3 3L16 10l4 4M9 9.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z',
  camera: 'M4 8h3l1.5-2h7L17 8h3v11H4zM12 16.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  heart: 'M12 20s-7-4.6-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.4 12 20 12 20z',
  comment: 'M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z',
  share: 'M22 3 11 14M22 3l-7 19-4-8-8-4 19-7z',
  bookmark: 'M6 4h12v17l-6-4-6 4z',
  dots: 'M5 12h.01M12 12h.01M19 12h.01',
  calendar: 'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4',
  fire: 'M12 3c1 3-2 4-2 7a2 2 0 1 0 4 0c0-1 1-1.5 1-1.5 1.5 2 2 3.5 2 5a5 5 0 0 1-10 0c0-3.5 3-5.5 5-10.5z',
  trash: 'M5 7h14M9 7V4h6v3M6 7l1 13h10l1-13',
  edit: 'M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4',
  x: 'M6 6l12 12M18 6 6 18',
  upload: 'M12 16V4M7 9l5-5 5 5M5 20h14',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  leaf: 'M5 20c0-9 6-15 15-15 0 9-6 15-15 15zM5 20c2-5 5-8 9-10',
  pen: 'M3 21l3-1 12-12-2-2L4 18l-1 3zM15 6l2 2',
  scan: 'M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16',
  send: 'M4 12l16-7-7 16-2.5-6.5L4 12z',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
};

function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 2, fill = 'none', style = {} }) {
  const d = ICON_PATHS[name] || '';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} style={{ display: 'block', flexShrink: 0, ...style }}>
      <path d={d} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

Object.assign(window, { Icon, ICON_PATHS });
