import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Node from './Node';

/**
 * Grid component — renders array or graph visualization
 */
export default function Grid({
  algorithm,
  arrayData,
  gridData,
  visitedIndices,
  visitedCells,
  pathCells,
  foundIndex,
  currentStep,
  isComplete,
  startPos,
  endPos,
  onCellClick,
}) {
  const isGraphAlgo = algorithm === 'dfs' || algorithm === 'bfs';

  // Determine node size based on data
  const nodeSize = useMemo(() => {
    if (isGraphAlgo) {
      const cols = gridData?.[0]?.length || 0;
      if (cols > 35) return 'xs';
      if (cols > 25) return 'sm';
      return 'md';
    }
    const len = arrayData?.length || 0;
    if (len > 30) return 'sm';
    if (len > 20) return 'md';
    return 'lg';
  }, [isGraphAlgo, arrayData?.length, gridData]);

  // Get state for array node
  const getArrayNodeState = (index) => {
    if (isComplete && currentStep?.type === 'not_found') return 'notfound';
    if (foundIndex === index) return 'found';
    if (currentStep?.index === index && !isComplete) return 'visiting';
    if (currentStep?.type === 'range' && currentStep?.range) {
      const [low, high] = currentStep.range;
      if (index >= low && index <= high && visitedIndices.has(index)) return 'visited';
      if (index >= low && index <= high) return 'range';
    }
    if (visitedIndices.has(index)) return 'visited';
    return 'unvisited';
  };

  // Get pointer labels for binary search
  const getPointerLabel = (index) => {
    if (algorithm !== 'binary' || !currentStep?.indices) return null;
    const { low, high, mid } = currentStep.indices;
    if (index === mid) return 'mid';
    if (index === low) return 'low';
    if (index === high) return 'high';
    return null;
  };

  // Get state for graph node
  const getGraphNodeState = (row, col) => {
    const key = `${row}-${col}`;
    if (gridData[row][col] === 1) return 'wall';
    if (row === startPos?.[0] && col === startPos?.[1]) {
      if (pathCells.has(key)) return 'path';
      if (visitedCells.has(key)) return 'visited';
      return 'start';
    }
    if (row === endPos?.[0] && col === endPos?.[1]) {
      if (foundIndex === key) return 'found';
      return 'end';
    }
    if (pathCells.has(key)) return 'path';
    if (foundIndex === key) return 'found';
    if (currentStep?.row === row && currentStep?.col === col && currentStep?.type === 'visit') return 'visiting';
    if (visitedCells.has(key)) return 'visited';
    return 'unvisited';
  };

  if (isGraphAlgo && gridData) {
    return (
      <motion.div
        className="flex flex-col items-center gap-0.5 p-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {gridData.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-0.5">
            {row.map((_, colIdx) => (
              <Node
                key={`${rowIdx}-${colIdx}`}
                row={rowIdx}
                col={colIdx}
                state={getGraphNodeState(rowIdx, colIdx)}
                type="graph"
                size={nodeSize}
                showValue={false}
                onClick={() => onCellClick?.(rowIdx, colIdx)}
              />
            ))}
          </div>
        ))}
      </motion.div>
    );
  }

  // Array visualization
  if (arrayData) {
    return (
      <motion.div
        className="flex flex-col items-center gap-6 p-4 w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Array bars visualization */}
        <div className="flex items-end justify-center gap-1 w-full min-h-[200px] px-4">
          {arrayData.map((value, index) => {
            const state = getArrayNodeState(index);
            const maxVal = Math.max(...arrayData);
            const heightPercent = (value / maxVal) * 100;

            const barColors = {
              unvisited: 'rgba(100, 116, 139, 0.4)',
              visiting: '#00d4ff',
              visited: '#a855f7',
              found: '#00ff88',
              range: 'rgba(255, 215, 0, 0.4)',
              notfound: '#ff006e',
            };

            return (
              <motion.div
                key={index}
                className="flex flex-col items-center gap-1 flex-1"
                style={{ maxWidth: 40 }}
              >
                {/* Pointer label */}
                {getPointerLabel(index) && (
                  <motion.span
                    className="text-[9px] font-mono font-bold px-1 py-0.5 rounded mb-1"
                    style={{
                      color: getPointerLabel(index) === 'mid' ? '#00d4ff' : getPointerLabel(index) === 'low' ? '#00ff88' : '#ff006e',
                      background: getPointerLabel(index) === 'mid' ? 'rgba(0,212,255,0.15)' : getPointerLabel(index) === 'low' ? 'rgba(0,255,136,0.15)' : 'rgba(255,0,110,0.15)',
                    }}
                    initial={{ y: -5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    {getPointerLabel(index)}
                  </motion.span>
                )}

                {/* Bar */}
                <motion.div
                  className="w-full rounded-t-md relative cursor-pointer"
                  style={{
                    background: barColors[state] || barColors.unvisited,
                    boxShadow: state === 'visiting' ? '0 0 15px rgba(0,212,255,0.5)' : state === 'found' ? '0 0 20px rgba(0,255,136,0.5)' : 'none',
                    minHeight: 4,
                  }}
                  animate={{
                    height: `${heightPercent * 1.8}px`,
                    scale: state === 'visiting' ? [1, 1.05, 1] : 1,
                  }}
                  transition={{
                    height: { duration: 0.3 },
                    scale: { duration: 0.6, repeat: state === 'visiting' ? Infinity : 0 },
                  }}
                  title={`Index: ${index}, Value: ${value}`}
                />

                {/* Value */}
                <span
                  className="text-[10px] font-mono font-medium"
                  style={{
                    color: state === 'visiting' ? '#00d4ff' : state === 'found' ? '#00ff88' : state === 'visited' ? '#a855f7' : '#64748b',
                  }}
                >
                  {value}
                </span>

                {/* Index */}
                <span className="text-[8px] font-mono" style={{ color: '#374151' }}>
                  {index}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Array cells row */}
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {arrayData.map((value, index) => (
            <Node
              key={index}
              value={value}
              index={index}
              state={getArrayNodeState(index)}
              type="array"
              size={nodeSize}
              pointerLabel={getPointerLabel(index)}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // Empty state
  return (
    <motion.div
      className="flex items-center justify-center h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-center">
        <span className="text-4xl mb-4 block">🎯</span>
        <p style={{ color: '#64748b' }} className="text-sm">
          Select an algorithm and generate data to begin
        </p>
      </div>
    </motion.div>
  );
}
