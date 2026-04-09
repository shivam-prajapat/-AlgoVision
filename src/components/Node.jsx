import { memo } from 'react';
import { motion } from 'framer-motion';

const Node = memo(function Node({
  value,
  index,
  row,
  col,
  state = 'unvisited', 
  isCurrentIndex = false,
  showValue = true,
  size = 'md',
  type = 'array', 
  onClick,
  pointerLabel,
}) {
  const stateStyles = {
    unvisited: {
      background: 'rgba(55, 65, 81, 0.5)',
      border: '1px solid rgba(255,255,255,0.08)',
      color: '#94a3b8',
      boxShadow: 'none',
    },
    visiting: {
      background: 'rgba(0, 212, 255, 0.3)',
      border: '1px solid rgba(0, 212, 255, 0.6)',
      color: '#ffffff',
      boxShadow: '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.15)',
    },
    visited: {
      background: 'rgba(168, 85, 247, 0.25)',
      border: '1px solid rgba(168, 85, 247, 0.5)',
      color: '#e2e8f0',
      boxShadow: '0 0 10px rgba(168, 85, 247, 0.2)',
    },
    found: {
      background: 'rgba(0, 255, 136, 0.3)',
      border: '1px solid rgba(0, 255, 136, 0.6)',
      color: '#ffffff',
      boxShadow: '0 0 25px rgba(0, 255, 136, 0.4), 0 0 50px rgba(0, 255, 136, 0.15)',
    },
    path: {
      background: 'rgba(0, 255, 136, 0.25)',
      border: '1px solid rgba(0, 255, 136, 0.5)',
      color: '#ffffff',
      boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)',
    },
    wall: {
      background: 'rgba(30, 30, 40, 0.9)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      color: '#475569',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
    },
    start: {
      background: 'rgba(0, 212, 255, 0.3)',
      border: '1px solid rgba(0, 212, 255, 0.6)',
      color: '#00d4ff',
      boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
    },
    end: {
      background: 'rgba(255, 0, 110, 0.3)',
      border: '1px solid rgba(255, 0, 110, 0.6)',
      color: '#ff006e',
      boxShadow: '0 0 20px rgba(255, 0, 110, 0.3)',
    },
    range: {
      background: 'rgba(255, 215, 0, 0.15)',
      border: '1px solid rgba(255, 215, 0, 0.3)',
      color: '#ffd700',
      boxShadow: '0 0 8px rgba(255, 215, 0, 0.15)',
    },
    enqueue: {
      background: 'rgba(0, 212, 255, 0.12)',
      border: '1px solid rgba(0, 212, 255, 0.25)',
      color: '#94a3b8',
      boxShadow: '0 0 5px rgba(0, 212, 255, 0.1)',
    },
    notfound: {
      background: 'rgba(255, 0, 110, 0.2)',
      border: '1px solid rgba(255, 0, 110, 0.4)',
      color: '#ff006e',
      boxShadow: '0 0 15px rgba(255, 0, 110, 0.2)',
    },
  };

  const sizeClasses = {
    xs: type === 'graph' ? 'w-6 h-6 text-[8px]' : 'w-8 h-10 text-[10px]',
    sm: type === 'graph' ? 'w-7 h-7 text-[9px]' : 'w-10 h-12 text-xs',
    md: type === 'graph' ? 'w-8 h-8 text-[10px]' : 'w-12 h-14 text-sm',
    lg: type === 'graph' ? 'w-10 h-10 text-xs' : 'w-14 h-16 text-base',
  };

  const style = stateStyles[state] || stateStyles.unvisited;

  return (
    <div className="relative flex flex-col items-center">
      {}
      {pointerLabel && (
        <motion.div
          className="absolute -top-5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded whitespace-nowrap z-10"
          style={{
            color: pointerLabel === 'mid' ? '#00d4ff' : pointerLabel === 'low' ? '#00ff88' : '#ff006e',
            background: pointerLabel === 'mid' ? 'rgba(0,212,255,0.15)' : pointerLabel === 'low' ? 'rgba(0,255,136,0.15)' : 'rgba(255,0,110,0.15)',
          }}
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {pointerLabel}
        </motion.div>
      )}

      <motion.div
        className={`${sizeClasses[size]} rounded-lg flex items-center justify-center font-mono font-semibold cursor-pointer select-none relative overflow-hidden`}
        style={style}
        onClick={onClick}
        animate={{
          scale: state === 'visiting' ? [1, 1.08, 1] : state === 'found' ? [1, 1.15, 1.05] : 1,
        }}
        transition={{
          duration: state === 'visiting' ? 0.6 : 0.3,
          repeat: state === 'visiting' ? Infinity : 0,
          ease: 'easeInOut',
        }}
        whileHover={{ scale: 1.1, zIndex: 10 }}
        title={
          type === 'graph'
            ? `(${row}, ${col}) — ${state}`
            : `Index: ${index}, Value: ${value}`
        }
      >
        {state === 'visiting' && (
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)',
            }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {type === 'graph' ? (
          state === 'wall' ? (
            <span className="text-[8px]">■</span>
          ) : state === 'start' ? (
            <span className="text-xs">▶</span>
          ) : state === 'end' ? (
            <span className="text-xs">◆</span>
          ) : null
        ) : showValue ? (
          <span className="relative z-10">{value}</span>
        ) : null}
      </motion.div>

      {type === 'array' && (
        <span
          className="mt-1 text-[9px] font-mono"
          style={{ color: '#475569' }}
        >
          {index}
        </span>
      )}
    </div>
  );
});

export default Node;
