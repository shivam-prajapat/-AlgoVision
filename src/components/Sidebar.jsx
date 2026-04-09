import { motion } from 'framer-motion';
import { linearSearchInfo } from '../algorithms/linearSearch';
import { binarySearchInfo } from '../algorithms/binarySearch';
import { dfsInfo } from '../algorithms/dfs';
import { bfsInfo } from '../algorithms/bfs';

const algorithms = [
  { id: 'linear', ...linearSearchInfo },
  { id: 'binary', ...binarySearchInfo },
  { id: 'dfs', ...dfsInfo },
  { id: 'bfs', ...bfsInfo },
];

const typeColors = {
  array: { bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.3)', text: '#00d4ff' },
  graph: { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', text: '#a855f7' },
};

export default function Sidebar({ selectedAlgorithm, onSelectAlgorithm, isRunning }) {
  return (
    <motion.aside
      className="glass rounded-2xl p-4 flex flex-col gap-2 h-full overflow-y-auto"
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 2.4, duration: 0.5, ease: 'easeOut' }}
    >
      <div className="mb-2">
        <h2
          className="text-xs font-semibold tracking-[0.2em] uppercase mb-1"
          style={{ color: '#64748b' }}
        >
          Algorithms
        </h2>
        <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {algorithms.map((algo) => {
        const isSelected = selectedAlgorithm === algo.id;
        const colors = typeColors[algo.type];

        return (
          <motion.button
            key={algo.id}
            onClick={() => !isRunning && onSelectAlgorithm(algo.id)}
            className={`relative w-full text-left p-3 rounded-xl border-0 cursor-pointer transition-all ${
              isRunning && !isSelected ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              background: isSelected ? colors.bg : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isSelected ? colors.border : 'rgba(255,255,255,0.05)'}`,
              boxShadow: isSelected ? `0 0 20px ${colors.bg}` : 'none',
            }}
            whileHover={!isRunning ? {
              backgroundColor: isSelected ? colors.bg : 'rgba(255,255,255,0.05)',
              scale: 1.02,
              y: -1,
            } : {}}
            whileTap={!isRunning ? { scale: 0.98 } : {}}
            layout
          >
            {/* Active indicator */}
            {isSelected && (
              <motion.div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                style={{ background: colors.text, boxShadow: `0 0 10px ${colors.text}` }}
                layoutId="activeIndicator"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            <div className="flex items-center gap-3">
              <span className="text-xl">{algo.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-sm font-semibold truncate"
                    style={{ color: isSelected ? '#e2e8f0' : '#94a3b8' }}
                  >
                    {algo.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium"
                    style={{
                      background: colors.bg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    {algo.timeComplexity}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      color: '#64748b',
                    }}
                  >
                    {algo.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Description shown when selected */}
            {isSelected && (
              <motion.p
                className="mt-2 text-[11px] leading-relaxed line-clamp-2 overflow-hidden"
                style={{ color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {algo.description}
              </motion.p>
            )}
          </motion.button>
        );
      })}

      {/* Legend Section */}
      <div className="mt-auto pt-4">
        <div className="h-px w-full mb-3" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <h3
          className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-2"
          style={{ color: '#475569' }}
        >
          Legend
        </h3>
        <div className="flex flex-col gap-1.5">
          {[
            { color: '#374151', label: 'Unvisited', border: 'rgba(255,255,255,0.1)' },
            { color: '#00d4ff', label: 'Current', border: '#00d4ff' },
            { color: '#a855f7', label: 'Visited', border: '#a855f7' },
            { color: '#00ff88', label: 'Found / Path', border: '#00ff88' },
            { color: '#ff006e', label: 'Wall / Not Found', border: '#ff006e' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{
                  background: item.color,
                  border: `1px solid ${item.border}`,
                  boxShadow: item.color !== '#374151' ? `0 0 6px ${item.color}40` : 'none',
                }}
              />
              <span className="text-[11px]" style={{ color: '#64748b' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}
