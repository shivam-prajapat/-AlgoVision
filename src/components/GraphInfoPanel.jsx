import { motion, AnimatePresence } from 'framer-motion';
import { reconstructPath } from '../algorithms/wasmAdapter';
function Badge({ children, color = '#64748b', bg }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 6px',
        borderRadius: 4,
        fontSize: 10,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600,
        color,
        background: bg || `${color}22`,
        border: `1px solid ${color}44`,
      }}
    >
      {children}
    </span>
  );
}
function Section({ title, children }) {
  return (
    <div>
      <div
        className="text-[10px] font-semibold tracking-widest uppercase mb-2"
        style={{ color: '#475569' }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
export default function GraphInfoPanel({
  algorithm,
  currentStep,
  stepCount,
  isRunning,
  isPaused,
  isComplete,
  nodes,
  edges,
  distTable,
  pqState,
  settledNodes,
  finalDistances,
  prevArray,
  startNode,
  sortedEdges,
  mstEdgeSet,
  rejectedEdgeSet,
  dsuState,
  mstCost,
  examineEdgeIdx,
  activeKruskalEdge,
}) {
  const isDijkstra = algorithm === 'dijkstra';
  const isKruskal  = algorithm === 'kruskal';
  const stepTypeMeta = {
    init:        { color: '#00d4ff', label: 'INIT' },
    settle:      { color: '#a855f7', label: 'SETTLE' },
    relax_check: { color: '#ffd700', label: 'CHECK' },
    relax:       { color: '#00ff88', label: 'RELAX' },
    examine:     { color: '#ffd700', label: 'EXAMINE' },
    accept:      { color: '#00ff88', label: 'ACCEPT' },
    reject:      { color: '#ff006e', label: 'REJECT' },
    done:        { color: '#00ff88', label: 'DONE' },
  };
  const stepMeta = currentStep ? (stepTypeMeta[currentStep.type] || { color: '#94a3b8', label: currentStep.type.toUpperCase() }) : null;
  const paths = [];
  if (isDijkstra && isComplete && prevArray && finalDistances && nodes) {
    nodes.forEach(n => {
      if (n.id !== startNode) {
        const p = reconstructPath(prevArray, startNode, n.id);
        if (p.length > 0) paths.push({ target: n.id, path: p, dist: finalDistances[n.id] });
      }
    });
  }
  const nodeLabel = (id) => {
    const n = nodes?.find(n => n.id === id);
    return n?.label ?? String(id);
  };
  return (
    <motion.aside
      className="glass rounded-2xl p-4 flex flex-col gap-4 h-full overflow-y-auto"
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.4, ease: 'easeOut' }}
    >
      {}
      <Section title="Status">
        <div className="flex items-center gap-2 flex-wrap">
          {stepMeta && <Badge color={stepMeta.color}>{stepMeta.label}</Badge>}
          {isRunning && !isPaused && (
            <Badge color="#00d4ff">▶ RUNNING</Badge>
          )}
          {isPaused && <Badge color="#ffd700">⏸ PAUSED</Badge>}
          {isComplete && <Badge color="#00ff88"> DONE</Badge>}
          {!isRunning && !isComplete && stepCount === 0 && (
            <span style={{ fontSize: 11, color: '#475569' }}>Press ▶ to start</span>
          )}
        </div>
        <div className="mt-2 text-xs font-mono" style={{ color: '#64748b' }}>
          Steps: {stepCount}
        </div>
      </Section>
      {}
      {currentStep?.explanation && (
        <Section title="Explanation">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.explanation}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-xs leading-relaxed rounded-xl px-3 py-2.5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#cbd5e1',
              }}
            >
              {currentStep.explanation}
            </motion.div>
          </AnimatePresence>
        </Section>
      )}
      {}
      {}
      {}
      {isDijkstra && (
        <>
          {}
          {distTable.length > 0 && (
            <Section title="Distance Table">
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ color: '#475569' }}>
                      <th style={{ textAlign: 'left',  padding: '3px 6px' }}>Node</th>
                      <th style={{ textAlign: 'right', padding: '3px 6px' }}>Dist</th>
                      <th style={{ textAlign: 'right', padding: '3px 6px' }}>Prev</th>
                      <th style={{ textAlign: 'center', padding: '3px 6px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {distTable.map(row => (
                      <tr
                        key={row.node}
                        style={{
                          background: row.settled
                            ? 'rgba(168,85,247,0.08)'
                            : currentStep?.node === row.node || currentStep?.toNode === row.node
                              ? 'rgba(0,212,255,0.08)'
                              : 'transparent',
                          transition: 'background 0.3s',
                        }}
                      >
                        <td style={{ padding: '3px 6px', fontWeight: 700, color: row.settled ? '#a855f7' : '#e2e8f0' }}>
                          {nodeLabel(row.node)}
                        </td>
                        <td style={{ padding: '3px 6px', textAlign: 'right', fontFamily: 'monospace', color: row.dist === -1 ? '#475569' : '#00d4ff' }}>
                          {row.dist === -1 ? '∞' : row.dist}
                        </td>
                        <td style={{ padding: '3px 6px', textAlign: 'right', color: '#64748b' }}>
                          {row.prev === -1 ? '–' : nodeLabel(row.prev)}
                        </td>
                        <td style={{ padding: '3px 6px', textAlign: 'center', color: '#00ff88' }}>
                          {row.settled ? '' : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}
          {}
          {pqState.length > 0 && (
            <Section title="Priority Queue">
              <div className="flex flex-wrap gap-1.5">
                {pqState.map((entry, i) => (
                  <div
                    key={`${entry.node}-${i}`}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono"
                    style={{
                      background: 'rgba(0,212,255,0.08)',
                      border: '1px solid rgba(0,212,255,0.2)',
                      color: '#00d4ff',
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>{nodeLabel(entry.node)}</span>
                    <span style={{ color: '#64748b' }}>:{entry.dist}</span>
                  </div>
                ))}
              </div>
              <div className="mt-1 text-[10px]" style={{ color: '#475569' }}>
                Sorted by distance (min first)
              </div>
            </Section>
          )}
          {}
          {isComplete && paths.length > 0 && (
            <Section title="Shortest Paths">
              <div className="flex flex-col gap-1.5">
                {paths.map(({ target, path, dist }) => (
                  <div
                    key={target}
                    className="rounded-xl px-3 py-2 text-xs"
                    style={{
                      background: dist === -1
                        ? 'rgba(255,0,110,0.06)'
                        : 'rgba(0,255,136,0.06)',
                      border: `1px solid ${dist === -1 ? 'rgba(255,0,110,0.2)' : 'rgba(0,255,136,0.2)'}`,
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span style={{ color: '#94a3b8' }}>
                        {nodeLabel(startNode)} → {nodeLabel(target)}
                      </span>
                      <span style={{ color: dist === -1 ? '#ff006e' : '#00ff88', fontWeight: 700, fontFamily: 'monospace' }}>
                        {dist === -1 ? '∞' : dist}
                      </span>
                    </div>
                    {path.length > 0 && (
                      <div style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 10 }}>
                        {path.map(nodeLabel).join(' → ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      )}
      {}
      {}
      {}
      {isKruskal && (
        <>
          {}
          {mstCost > 0 && (
            <div
              className="rounded-xl px-3 py-2 text-center"
              style={{
                background: isComplete ? 'rgba(0,255,136,0.08)' : 'rgba(255,215,0,0.06)',
                border: `1px solid ${isComplete ? 'rgba(0,255,136,0.25)' : 'rgba(255,215,0,0.2)'}`,
              }}
            >
              <div className="text-[10px] tracking-widest uppercase mb-1" style={{ color: '#475569' }}>
                MST Cost
              </div>
              <div className="text-2xl font-bold font-mono" style={{ color: isComplete ? '#00ff88' : '#ffd700' }}>
                {mstCost}
              </div>
              {isComplete && <div className="text-[10px] mt-1" style={{ color: '#475569' }}>MST Complete </div>}
            </div>
          )}
          {}
          {sortedEdges.length > 0 && (
            <Section title="Sorted Edge List">
              <div className="flex flex-col gap-1" style={{ maxHeight: 200, overflowY: 'auto' }}>
                {sortedEdges.map((e, idx) => {
                  const key1 = `${e.u}-${e.v}`;
                  const key2 = `${e.v}-${e.u}`;
                  const inMST     = mstEdgeSet?.has(key1) || mstEdgeSet?.has(key2);
                  const rejected  = rejectedEdgeSet?.has(key1) || rejectedEdgeSet?.has(key2);
                  const examining = examineEdgeIdx === idx;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs px-2 py-1 rounded-lg font-mono"
                      style={{
                        background: inMST ? 'rgba(0,255,136,0.08)'
                          : rejected ? 'rgba(255,0,110,0.06)'
                          : examining ? 'rgba(255,215,0,0.08)'
                          : 'transparent',
                        border: `1px solid ${inMST ? 'rgba(0,255,136,0.2)' : rejected ? 'rgba(255,0,110,0.15)' : examining ? 'rgba(255,215,0,0.2)' : 'transparent'}`,
                        color: inMST ? '#00ff88' : rejected ? '#ff006e66' : examining ? '#ffd700' : '#64748b',
                        transition: 'background 0.3s',
                      }}
                    >
                      <span>{nodeLabel(e.u)} — {nodeLabel(e.v)}</span>
                      <span style={{ fontWeight: 700 }}>w={e.w}</span>
                      <span style={{ fontSize: 9 }}>
                        {inMST ? '' : rejected ? '' : examining ? '▶' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}
          {}
          {dsuState.length > 0 && (
            <Section title="DSU Parent Array">
              <div className="flex flex-wrap gap-1.5">
                {dsuState.map((parent, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center px-2 py-1 rounded-lg text-xs"
                    style={{
                      background: parent === i ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${parent === i ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
                      minWidth: 36,
                    }}
                  >
                    <span style={{ color: '#64748b', fontSize: 9 }}>{nodeLabel(i)}</span>
                    <span style={{ color: parent === i ? '#00d4ff' : '#94a3b8', fontFamily: 'monospace', fontWeight: 700 }}>
                      {nodeLabel(parent)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-1 text-[10px]" style={{ color: '#475569' }}>
                Blue = root node (parent of itself)
              </div>
            </Section>
          )}
          {}
          {mstEdgeSet && mstEdgeSet.size > 0 && (
            <Section title={`MST Edges (${mstEdgeSet.size})`}>
              <div className="flex flex-col gap-1">
                {[...mstEdgeSet].map((key) => {
                  const [u, v] = key.split('-').map(Number);
                  const edge = sortedEdges.find(e =>
                    (e.u === u && e.v === v) || (e.u === v && e.v === u)
                  );
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between text-xs px-2 py-1 rounded-lg font-mono"
                      style={{
                        background: 'rgba(0,255,136,0.08)',
                        border: '1px solid rgba(0,255,136,0.2)',
                        color: '#00ff88',
                      }}
                    >
                      <span>{nodeLabel(u)} — {nodeLabel(v)}</span>
                      {edge && <span style={{ fontWeight: 700 }}>w={edge.w}</span>}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}
        </>
      )}
      {}
      <div style={{ marginTop: 'auto', paddingTop: 8 }}>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 8 }} />
        <div className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#475569' }}>
          Legend
        </div>
        <div className="flex flex-col gap-1.5">
          {isDijkstra && [
            { color: '#f59e0b', label: 'Start node' },
            { color: '#00d4ff', label: 'Checking edge' },
            { color: '#00ff88', label: 'Relaxed (improved)' },
            { color: '#a855f7', label: 'Settled (finalized)' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, boxShadow: `0 0 6px ${item.color}66`, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#64748b' }}>{item.label}</span>
            </div>
          ))}
          {isKruskal && [
            { color: '#ffd700', label: 'Edge being examined' },
            { color: '#00ff88', label: 'Edge accepted (MST)' },
            { color: '#ff006e', label: 'Edge rejected (cycle)' },
            { color: '#00d4ff', label: 'Root node in DSU' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color, boxShadow: `0 0 6px ${item.color}66`, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#64748b' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}
