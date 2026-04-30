import { memo } from 'react';
const SIZES = {
  graph: { xs: [10, 10], sm: [12, 12], md: [14, 14], lg: [18, 18] },
  array: { xs: [28, 36], sm: [36, 44], md: [44, 52], lg: [52, 60] },
};
const STATE_STYLES = {
  unvisited: { background: 'rgba(55,65,81,0.5)',    border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', boxShadow: 'none' },
  visiting:  { background: 'rgba(0,212,255,0.3)',   border: '1px solid rgba(0,212,255,0.6)',    color: '#ffffff',  boxShadow: '0 0 12px rgba(0,212,255,0.5)' },
  visited:   { background: 'rgba(168,85,247,0.25)', border: '1px solid rgba(168,85,247,0.5)',   color: '#e2e8f0', boxShadow: '0 0 6px rgba(168,85,247,0.3)' },
  found:     { background: 'rgba(0,255,136,0.3)',   border: '1px solid rgba(0,255,136,0.6)',    color: '#ffffff',  boxShadow: '0 0 16px rgba(0,255,136,0.5)' },
  path:      { background: 'rgba(0,255,136,0.25)',  border: '1px solid rgba(0,255,136,0.5)',    color: '#ffffff',  boxShadow: '0 0 8px rgba(0,255,136,0.3)' },
  wall:      { background: 'rgba(20,20,30,0.95)',   border: '1px solid rgba(255,255,255,0.04)', color: '#374151', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)' },
  start:     { background: 'rgba(0,212,255,0.3)',   border: '1px solid rgba(0,212,255,0.7)',    color: '#00d4ff', boxShadow: '0 0 12px rgba(0,212,255,0.4)' },
  end:       { background: 'rgba(255,0,110,0.3)',   border: '1px solid rgba(255,0,110,0.7)',    color: '#ff006e', boxShadow: '0 0 12px rgba(255,0,110,0.4)' },
  range:     { background: 'rgba(255,215,0,0.15)',  border: '1px solid rgba(255,215,0,0.3)',    color: '#ffd700', boxShadow: '0 0 6px rgba(255,215,0,0.2)' },
  enqueue:   { background: 'rgba(0,212,255,0.1)',   border: '1px solid rgba(0,212,255,0.2)',    color: '#94a3b8', boxShadow: 'none' },
  notfound:  { background: 'rgba(255,0,110,0.2)',   border: '1px solid rgba(255,0,110,0.4)',    color: '#ff006e', boxShadow: '0 0 10px rgba(255,0,110,0.2)' },
};
const Node = memo(function Node({
  value, index, row, col,
  state = 'unvisited',
  showValue = true,
  size = 'md',
  type = 'array',
  onClick,
  pointerLabel,
}) {
  const ss = STATE_STYLES[state] || STATE_STYLES.unvisited;
  const [w, h] = (SIZES[type] || SIZES.array)[size] || SIZES.array.md;
  const labelColor = pointerLabel === 'mid' ? '#00d4ff'
    : pointerLabel === 'L' ? '#00ff88'
    : '#ff006e';
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {pointerLabel && (
        <div style={{
          position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', fontWeight: 700,
          padding: '1px 4px', borderRadius: 3, whiteSpace: 'nowrap', zIndex: 10,
          color: labelColor, background: `${labelColor}22`, border: `1px solid ${labelColor}44`,
        }}>
          {pointerLabel}
        </div>
      )}
      <div
        style={{
          width: w, height: h,
          borderRadius: type === 'graph' ? 3 : 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace', fontWeight: 600,
          fontSize: type === 'graph' ? 7 : 12,
          cursor: onClick ? 'pointer' : 'default',
          userSelect: 'none',
          transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
          ...ss,
        }}
        onClick={onClick}
        title={type === 'graph' ? `(${row},${col})` : `[${index}]=${value}`}
      >
        {type === 'graph' ? (
          state === 'wall'  ? '■' :
          state === 'start' ? '▶' :
          state === 'end'   ? '◆' : null
        ) : showValue ? value : null}
      </div>
      {type === 'array' && (
        <span style={{ marginTop: 2, fontSize: 8, fontFamily: 'monospace', color: '#475569' }}>
          {index}
        </span>
      )}
    </div>
  );
});
export default Node;
