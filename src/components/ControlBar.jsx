export default function ControlBar({
  isRunning, isPaused, isComplete, stepCount, speed,
  onPlay, onPause, onResume, onStep, onReset, onSpeedChange,
  isArray, target, onTargetChange, onCustomArray
}) {
  const canStart = !isRunning && !isComplete;
  const canStep  = !isComplete;
  const btn = (label, onClick, variant = 'default', disabled = false) => {
    const colors = {
      primary: { bg: 'linear-gradient(135deg,#00d4ff,#a855f7)', color: '#fff' },
      pause:   { bg: 'rgba(255,215,0,0.15)',  color: '#ffd700' },
      resume:  { bg: 'rgba(0,212,255,0.15)',  color: '#00d4ff' },
      step:    { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8' },
      reset:   { bg: 'rgba(255,0,110,0.1)',    color: '#ff006e' },
      default: { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8' },
    };
    const s = colors[variant] || colors.default;
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          padding: '8px 18px', borderRadius: 10, border: 'none',
          background: disabled ? 'rgba(255,255,255,0.04)' : s.bg,
          color: disabled ? '#334155' : s.color,
          fontWeight: 700, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          transition: 'all .2s',
          boxShadow: !disabled && variant === 'primary' ? '0 0 20px rgba(0,212,255,0.3)' : 'none',
        }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
      >
        {label}
      </button>
    );
  };
  return (
    <div className="control-bar">
      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        {}
        {canStart  && btn('▶ Run',    onPlay,   'primary', false)}
        {isRunning && !isPaused && btn('⏸ Pause',  onPause,  'pause')}
        {isRunning &&  isPaused && btn('▶ Resume', onResume, 'resume')}
        {}
        {btn('⏭ Step', onStep, 'step', !canStep)}
        {}
        {btn('↺ Reset', onReset, 'reset')}
        
        {isArray && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 10, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 10 }}>
            <input
              type="text"
              placeholder="Target..."
              value={target}
              onChange={e => onTargetChange?.(e.target.value)}
              disabled={isRunning}
              title="Target value to search for"
              style={{
                width: 80, padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: 12, outline: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Custom array (comma separated)..."
              title="Enter comma-separated numbers and click away to apply"
              onBlur={(e) => {
                if(isRunning) return;
                const arr = e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
                if (arr.length > 0 && onCustomArray) onCustomArray(arr);
              }}
              onKeyDown={(e) => {
                if(e.key === 'Enter') e.currentTarget.blur();
              }}
              disabled={isRunning}
              style={{
                width: 220, padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: 12, outline: 'none'
              }}
            />
          </div>
        )}

        <div style={{ flex:1 }} />
        {}
        <div style={{ fontSize:11, fontFamily:'monospace', color:'#64748b', whiteSpace:'nowrap' }}>
          Steps: {stepCount}
        </div>
        {}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:10, color:'#475569' }}>Slow</span>
          <input
            type="range" min={50} max={1200} step={50}
            value={1250 - speed}
            onChange={e => onSpeedChange(1250 - Number(e.target.value))}
            style={{ width: 90, accentColor:'#a855f7', cursor:'pointer' }}
          />
          <span style={{ fontSize:10, color:'#475569' }}>Fast</span>
        </div>
      </div>
    </div>
  );
}
