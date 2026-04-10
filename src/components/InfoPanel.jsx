import { motion, AnimatePresence } from 'framer-motion';
import { linearSearchInfo } from '../algorithms/linearSearch';
import { binarySearchInfo } from '../algorithms/binarySearch';
import { dfsInfo } from '../algorithms/dfs';
import { bfsInfo } from '../algorithms/bfs';

const algorithmInfoMap = {
  linear: linearSearchInfo,
  binary: binarySearchInfo,
  dfs: dfsInfo,
  bfs: bfsInfo,
};

export default function InfoPanel({
  algorithm,
  currentStep,
  stepCount,
  isRunning,
  isPaused,
  isComplete,
}) {
  const info = algorithmInfoMap[algorithm];
  if (!info) return null;

  const statusColor = isComplete
    ? currentStep?.type === 'found'
      ? '#00ff88'
      : '#ff006e'
    : isRunning
    ? isPaused
      ? '#ffd700'
      : '#00d4ff'
    : '#64748b';

  const statusText = isComplete
    ? currentStep?.type === 'found'
      ? 'FOUND'
      : 'NOT FOUND'
    : isRunning
    ? isPaused
      ? 'PAUSED'
      : 'RUNNING'
    : 'READY';

  return (
    <motion.div
      className="glass rounded-2xl p-4 flex flex-col gap-4 h-full overflow-y-auto"
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 2.5, duration: 0.5, ease: 'easeOut' }}
    >
      {/* Algorithm Name */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{info.icon}</span>
          <h3 className="text-sm font-bold" style={{ color: '#e2e8f0' }}>
            {info.name}
          </h3>
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: '#64748b' }}>
          {info.description}
        </p>
      </div>

      <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      <div>
        <h4
          className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2"
          style={{ color: '#475569' }}
        >
          Complexity
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Time (Avg)', value: info.timeComplexity, color: '#00d4ff' },
            { label: 'Space', value: info.spaceComplexity, color: '#a855f7' },
            { label: 'Best Case', value: info.bestCase, color: '#00ff88' },
            { label: 'Worst Case', value: info.worstCase, color: '#ff006e' },
          ].map((item) => (
            <div
              key={item.label}
              className="p-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <div className="text-[9px] mb-0.5" style={{ color: '#475569' }}>
                {item.label}
              </div>
              <div
                className="text-sm font-mono font-bold"
                style={{ color: item.color }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      <div>
        <h4
          className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2"
          style={{ color: '#475569' }}
        >
          Status
        </h4>
        <div className="flex items-center gap-2 mb-2">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ background: statusColor }}
            animate={isRunning && !isPaused ? {
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span
            className="text-xs font-mono font-bold tracking-wider"
            style={{ color: statusColor }}
          >
            {statusText}
          </span>
        </div>

        <div
          className="p-2 rounded-lg mb-2"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px]" style={{ color: '#475569' }}>Steps</span>
            <span className="text-sm font-mono font-bold" style={{ color: '#e2e8f0' }}>
              {stepCount}
            </span>
          </div>
        </div>
      </div>

      <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      <div className="flex-1">
        <h4
          className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2"
          style={{ color: '#475569' }}
        >
          Current Step
        </h4>
        <AnimatePresence mode="wait">
          <motion.div
            key={stepCount}
            className="p-3 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderLeft: `2px solid ${statusColor}`,
            }}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
              {currentStep?.explanation || 'Click "Start" to begin the visualization'}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-auto">
        <div className="h-px mb-3" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <h4
          className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2"
          style={{ color: '#374151' }}
        >
          Shortcuts
        </h4>
        <div className="flex flex-col gap-1">
          {[
            { key: 'Space', action: 'Play/Pause' },
            { key: 'S', action: 'Step' },
            { key: 'R', action: 'Reset' },
            { key: 'G', action: 'Generate' },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <kbd
                className="px-1.5 py-0.5 rounded text-[9px] font-mono"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#64748b',
                }}
              >
                {item.key}
              </kbd>
              <span className="text-[10px]" style={{ color: '#475569' }}>
                {item.action}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
