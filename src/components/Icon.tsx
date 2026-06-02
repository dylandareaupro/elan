/* Thin 1.7px line icons, rounded — ported from core.jsx */
import React from "react";

export function Icon({ name, size = 22, stroke = 1.8, color = "currentColor", style }: {
  name: string; size?: number; stroke?: number; color?: string; style?: React.CSSProperties;
}) {
  const p = { fill: "none", stroke: color, strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const paths: Record<string, React.ReactNode> = {
    play: <path d="M7 4.5v15l12.5-7.5z" fill={color} stroke={color} strokeWidth={stroke} strokeLinejoin="round" />,
    pause: <g {...p}><line x1="8" y1="5" x2="8" y2="19" /><line x1="16" y1="5" x2="16" y2="19" /></g>,
    stop: <g {...p}><rect x="6.5" y="6.5" width="11" height="11" rx="2.5" fill={color} /></g>,
    refresh: <g {...p}><path d="M3 11a9 9 0 0 1 15-6.7L21 7" /><path d="M21 4v3h-3" /><path d="M21 13a9 9 0 0 1-15 6.7L3 17" /><path d="M3 20v-3h3" /></g>,
    chevR: <polyline {...p} points="9 6 15 12 9 18" />,
    chevL: <polyline {...p} points="15 6 9 12 15 18" />,
    arrowR: <g {...p}><line x1="4" y1="12" x2="19" y2="12" /><polyline points="13 5 20 12 13 19" /></g>,
    check: <polyline {...p} points="4 12.5 9.5 18 20 6" />,
    settings: <g {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2.5l1.4 2.6 2.9-.6.5 2.9 2.6 1.4-1.3 2.6 1.3 2.6-2.6 1.4-.5 2.9-2.9-.6L12 21.5l-1.4-2.6-2.9.6-.5-2.9L4.6 15l1.3-2.6L4.6 9.8 7.2 8.4l.5-2.9 2.9.6z" /></g>,
    arrowL: <g {...p}><line x1="20" y1="12" x2="5" y2="12" /><polyline points="11 5 4 12 11 19" /></g>,
    flame: <path {...p} d="M12 3c.5 3-2 4.2-2 7a2 2 0 1 0 3.8.8C15 13 13 11 14 8c2 1.4 3.5 3.7 3.5 6.2A5.5 5.5 0 0 1 6.5 14C6.5 9.5 10 7 12 3z" />,
    flameF: <path d="M12 2.5c.6 3.3-2.2 4.6-2.2 7.6A2.2 2.2 0 0 0 14 11c1.2-2.1-.9-4.3.2-7.5 2.2 1.5 3.9 4.1 3.9 6.9A6.1 6.1 0 1 1 6 10.4C6 5.5 10 2.8 12 2.5z" fill={color} />,
    calendar: <g {...p}><rect x="3.5" y="5" width="17" height="16" rx="2.5" /><line x1="3.5" y1="9.5" x2="20.5" y2="9.5" /><line x1="8" y1="3" x2="8" y2="6" /><line x1="16" y1="3" x2="16" y2="6" /></g>,
    volume: <g {...p}><path d="M4 9v6h4l5 4V5L8 9z" /><path d="M16.5 8.5a5 5 0 0 1 0 7" /><path d="M19 6a9 9 0 0 1 0 12" /></g>,
    volumeX: <g {...p}><path d="M4 9v6h4l5 4V5L8 9z" /><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></g>,
    vibrate: <g {...p}><rect x="8.5" y="5" width="7" height="14" rx="1.6" /><line x1="3.5" y1="9" x2="3.5" y2="15" /><line x1="20.5" y1="9" x2="20.5" y2="15" /></g>,
    x: <g {...p}><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></g>,
    share: <g {...p}><path d="M12 15V3" /><polyline points="8 7 12 3 16 7" /><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" /></g>,
    skip: <g {...p}><polyline points="6 6 12 12 6 18" /><line x1="15" y1="6" x2="15" y2="18" /></g>,
    bell: <g {...p}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></g>,
    clock: <g {...p}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></g>,
    target: <g {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill={color} /></g>,
    heart: <path {...p} d="M12 20s-7-4.5-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 3.5C19 15.5 12 20 12 20z" />,
    heartF: <path d="M12 20.4S4.5 15.7 4.5 10.3A4.2 4.2 0 0 1 12 6.6a4.2 4.2 0 0 1 7.5 3.7c0 5.4-7.5 10.1-7.5 10.1z" fill={color} />,
    bolt: <path {...p} d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />,
    boltF: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill={color} />,
    expand: <g {...p}><polyline points="9 4 4 4 4 9" /><polyline points="15 4 20 4 20 9" /><polyline points="15 20 20 20 20 15" /><polyline points="9 20 4 20 4 15" /></g>,
    edit: <g {...p}><path d="M16.5 3.5a2 2 0 0 1 3 3L8 18l-4 1 1-4z" /></g>,
    trophy: <g {...p}><path d="M7 4h10v4a5 5 0 0 1-10 0z" /><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" /><line x1="12" y1="13" x2="12" y2="17" /><path d="M8.5 20h7l-.7-3h-5.6z" /></g>,
    medal: <g {...p}><circle cx="12" cy="14" r="6" /><path d="M9 3l3 5 3-5" /><path d="M11 13l1-2 1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L9 13.3z" fill={color} stroke="none" /></g>,
    footstep: <g {...p}><path d="M8 4c1.5 0 2.5 2 2.5 4.5S9.5 13 8 13s-2.5-2-2.5-4.5S6.5 4 8 4z" /><path d="M6 14.5c0 2 .8 3.5 2 3.5s2-1 2-2.5-1-2.5-2-2.5-2 .5-2 1.5z" /></g>,
    muscle: <g {...p}><path d="M5 9c2-2 4-2 5 0 1.5 3 4 3 6 2.5 2-.5 3 1 3 2.5 0 2-2 5-6 5-5 0-8-3-8-7 0-2 0-3 0-3z" /></g>,
    stopwatch: <g {...p}><circle cx="12" cy="13" r="8" /><line x1="12" y1="13" x2="12" y2="9" /><line x1="9.5" y1="2.5" x2="14.5" y2="2.5" /><line x1="12" y1="2.5" x2="12" y2="5" /></g>,
    run: <g {...p}><circle cx="14" cy="5" r="1.6" fill={color} /><path d="M5 20l3-4 3 2 1-5-3-2 4-3 2 3h3" /><path d="M9 13l-1-3" /></g>,
    image: <g {...p}><rect x="3.5" y="4" width="17" height="16" rx="2.5" /><circle cx="9" cy="9.5" r="1.6" /><path d="M4 17l4.5-4.5 3.5 3.5 3-3L20 17" /></g>,
    drop: <path {...p} d="M12 3.5C12 3.5 6 10 6 14.5a6 6 0 0 0 12 0C18 10 12 3.5 12 3.5z" />,
    plus: <g {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></g>,
    chart: <g {...p}><path d="M4 16c2-1 3-5 5-5s3 3 5 1.5S18 7 21 6" /></g>,
    up: <g {...p}><polyline points="6 14 10 9 13 12 18 6" /><polyline points="14 6 18 6 18 10" /></g>,
    home: <g {...p}><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9.5a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V10" /></g>,
    grid: <g {...p}><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></g>,
    user: <g {...p}><circle cx="12" cy="8.5" r="3.7" /><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" /></g>,
    search: <g {...p}><circle cx="11" cy="11" r="7" /><line x1="16.2" y1="16.2" x2="21" y2="21" /></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
