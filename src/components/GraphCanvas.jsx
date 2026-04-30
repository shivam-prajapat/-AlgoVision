import { useCallback, useRef, useState, useEffect } from 'react';
const COLORS = {
  nodeBg:        '#1e293b',
  nodeBorder:    'rgba(100,116,139,0.6)',
  nodeText:      '#e2e8f0',
  nodeHover:     '#334155',
  settled:       '#7c3aed',   
  activeNode:    '#00d4ff',   
  mstNode:       '#00ff88',   
  startNode:     '#f59e0b',   
  edgeDefault:   'rgba(100,116,139,0.4)',
  edgeActive:    '#00d4ff',
  edgeRelax:     '#00ff88',
  edgeReject:    '#ff006e',
  edgeMST:       '#00ff88',
  edgeExamine:   '#ffd700',
  weightText:    '#94a3b8',
  background:    'transparent',
};
const NODE_RADIUS = 22;
const ARROW_SIZE  = 10;
function midPoint(x1, y1, x2, y2, offset = 0) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  if (offset === 0) return { x: mx, y: my };
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  return { x: mx - ((y2 - y1) / len) * offset, y: my + ((x1 - x2) / len) * offset };
}
function edgeEndpoint(nx, ny, tx, ty, r = NODE_RADIUS) {
  const dx = tx - nx;
  const dy = ty - ny;
  const len = Math.hypot(dx, dy) || 1;
  return { x: nx + (dx / len) * r, y: ny + (dy / len) * r };
}
function edgeKey(u, v) {
  return `${Math.min(u, v)}-${Math.max(u, v)}`;
}
export default function GraphCanvas({
  nodes,            
  edges,            
  directed,         
  algorithm,        
  startNode,        
  selectedNodes,    
  onNodeClick,      
  onCanvasClick,    
  onNodeRightClick, 
  onNodeDrag,       
  settledNodes,
  activeEdge,
  mstEdgeSet,
  rejectedEdgeSet,
  activeKruskalEdge,
  distTable,
  isRunning,
  isComplete,
}) {
  const svgRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [dragging, setDragging] = useState(null); 
  const getSVGPoint = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: svgP.x, y: svgP.y };
  }, []);
  const handleSVGClick = useCallback((e) => {
    if (dragging) return;
    if (e.target !== svgRef.current && e.target.tagName !== 'rect') return;
    const { x, y } = getSVGPoint(e);
    onCanvasClick?.(x, y);
  }, [dragging, getSVGPoint, onCanvasClick]);
  const handleNodeMouseDown = useCallback((e, nodeId) => {
    e.stopPropagation();
    const { x, y } = getSVGPoint(e);
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setDragging({ nodeId, offsetX: x - node.x, offsetY: y - node.y });
  }, [getSVGPoint, nodes]);
  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    const { x, y } = getSVGPoint(e);
    onNodeDrag?.(dragging.nodeId, x - dragging.offsetX, y - dragging.offsetY);
  }, [dragging, getSVGPoint, onNodeDrag]);
  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);
  const handleNodeClick = useCallback((e, nodeId) => {
    e.stopPropagation();
    if (dragging) return;
    onNodeClick?.(nodeId);
  }, [dragging, onNodeClick]);
  const handleNodeRightClick = useCallback((e, nodeId) => {
    e.preventDefault();
    e.stopPropagation();
    onNodeRightClick?.(nodeId);
  }, [onNodeRightClick]);
  const getEdgeStyle = useCallback((edge) => {
    const key1 = `${edge.u}-${edge.v}`;
    const key2 = `${edge.v}-${edge.u}`;
    if (algorithm === 'kruskal') {
      if (mstEdgeSet?.has(key1) || mstEdgeSet?.has(key2)) {
        return { color: COLORS.edgeMST, width: 3, glow: true };
      }
      if (activeKruskalEdge) {
        const ak = activeKruskalEdge;
        if ((ak.u === edge.u && ak.v === edge.v) || (ak.u === edge.v && ak.v === edge.u)) {
          if (ak.status === 'accept')  return { color: COLORS.edgeRelax, width: 3, glow: true };
          if (ak.status === 'reject')  return { color: COLORS.edgeReject, width: 2.5, glow: true };
          if (ak.status === 'examine') return { color: COLORS.edgeExamine, width: 2.5, glow: true };
        }
      }
      if (rejectedEdgeSet?.has(key1) || rejectedEdgeSet?.has(key2)) {
        return { color: COLORS.edgeReject, width: 1.5, opacity: 0.5 };
      }
    }
    if (algorithm === 'dijkstra' && activeEdge) {
      if (activeEdge.fromNode === edge.u && activeEdge.toNode === edge.v) {
        return activeEdge.type === 'relax'
          ? { color: COLORS.edgeRelax, width: 3, glow: true }
          : { color: COLORS.edgeActive, width: 2.5, glow: true };
      }
    }
    return { color: COLORS.edgeDefault, width: 1.5 };
  }, [algorithm, mstEdgeSet, activeKruskalEdge, rejectedEdgeSet, activeEdge]);
  const getNodeStyle = useCallback((node) => {
    const id = node.id;
    const isStart    = id === startNode;
    const isSelected = selectedNodes?.includes(id);
    if (algorithm === 'dijkstra') {
      if (isStart)                   return { fill: COLORS.startNode,  glow: '#f59e0b' };
      if (settledNodes?.has(id))     return { fill: COLORS.settled,    glow: '#7c3aed' };
      if (activeEdge?.toNode === id) return { fill: COLORS.activeNode, glow: '#00d4ff' };
    }
    if (algorithm === 'kruskal' && activeKruskalEdge) {
      const ak = activeKruskalEdge;
      if (id === ak.u || id === ak.v) {
        if (ak.status === 'accept')  return { fill: COLORS.mstNode,   glow: '#00ff88' };
        if (ak.status === 'reject')  return { fill: '#ff006e',         glow: '#ff006e' };
        return { fill: COLORS.activeNode, glow: '#00d4ff' };
      }
    }
    if (isSelected) return { fill: COLORS.activeNode, glow: '#00d4ff' };
    if (hoveredNode === id) return { fill: COLORS.nodeHover, glow: null };
    return { fill: COLORS.nodeBg, glow: null };
  }, [algorithm, startNode, selectedNodes, settledNodes, activeEdge, activeKruskalEdge, hoveredNode]);
  const parallelMap = {};
  edges.forEach(edge => {
    const k = edgeKey(edge.u, edge.v);
    if (!parallelMap[k]) parallelMap[k] = [];
    parallelMap[k].push(edge.id);
  });
  return (
    <svg
      ref={svgRef}
      style={{ width: '100%', height: '100%', cursor: dragging ? 'grabbing' : 'crosshair' }}
      onClick={handleSVGClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <defs>
        {}
        <marker id="arrow-default" markerWidth="10" markerHeight="10" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.edgeDefault} />
        </marker>
        <marker id="arrow-active" markerWidth="10" markerHeight="10" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.edgeActive} />
        </marker>
        <marker id="arrow-relax" markerWidth="10" markerHeight="10" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.edgeRelax} />
        </marker>
        <marker id="arrow-reject" markerWidth="10" markerHeight="10" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.edgeReject} />
        </marker>
        {}
        <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {}
      <rect x="0" y="0" width="100%" height="100%" fill="transparent" />
      {}
      {edges.map(edge => {
        const uNode = nodes.find(n => n.id === edge.u);
        const vNode = nodes.find(n => n.id === edge.v);
        if (!uNode || !vNode) return null;
        const style = getEdgeStyle(edge);
        const k = edgeKey(edge.u, edge.v);
        const parallelCount = parallelMap[k]?.length ?? 1;
        const parallelIndex = parallelMap[k]?.indexOf(edge.id) ?? 0;
        const curveOffset  = parallelCount > 1 ? (parallelIndex === 0 ? 20 : -20) : 0;
        const p1 = edgeEndpoint(uNode.x, uNode.y, vNode.x, vNode.y);
        const p2 = edgeEndpoint(vNode.x, vNode.y, uNode.x, uNode.y);
        const mp = midPoint(p1.x, p1.y, p2.x, p2.y, curveOffset);
        const pathD = curveOffset !== 0
          ? `M ${p1.x} ${p1.y} Q ${mp.x} ${mp.y} ${p2.x} ${p2.y}`
          : `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
        const arrowMarker = directed
          ? style.color === COLORS.edgeRelax ? 'url(#arrow-relax)'
          : style.color === COLORS.edgeActive ? 'url(#arrow-active)'
          : style.color === COLORS.edgeReject ? 'url(#arrow-reject)'
          : 'url(#arrow-default)'
          : undefined;
        const labelPos = midPoint(uNode.x, uNode.y, vNode.x, vNode.y, curveOffset + (curveOffset > 0 ? 12 : curveOffset < 0 ? -12 : 12));
        return (
          <g key={edge.id}>
            <path
              d={pathD}
              stroke={style.color}
              strokeWidth={style.width}
              strokeOpacity={style.opacity ?? 1}
              fill="none"
              markerEnd={arrowMarker}
              style={{
                transition: 'stroke 0.3s, stroke-width 0.3s',
                filter: style.glow ? `drop-shadow(0 0 6px ${style.color})` : undefined,
              }}
            />
            {}
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontFamily="'JetBrains Mono', monospace"
              fill={style.glow ? style.color : COLORS.weightText}
              style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.3s' }}
            >
              {edge.weight}
            </text>
          </g>
        );
      })}
      {}
      {nodes.map(node => {
        const ns = getNodeStyle(node);
        const distEntry = distTable?.find(d => d.node === node.id);
        const distLabel = distEntry ? (distEntry.dist === -1 ? '∞' : String(distEntry.dist)) : null;
        return (
          <g
            key={node.id}
            transform={`translate(${node.x}, ${node.y})`}
            style={{ cursor: isRunning ? 'default' : 'pointer' }}
            onClick={(e) => handleNodeClick(e, node.id)}
            onMouseDown={(e) => !isRunning && handleNodeMouseDown(e, node.id)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onContextMenu={(e) => !isRunning && handleNodeRightClick(e, node.id)}
          >
            {}
            {ns.glow && (
              <circle
                r={NODE_RADIUS + 6}
                fill="none"
                stroke={ns.glow}
                strokeWidth="2"
                strokeOpacity="0.4"
                style={{ animation: 'glowPulse 1.5s ease-in-out infinite' }}
              />
            )}
            {}
            <circle
              r={NODE_RADIUS}
              fill={ns.fill}
              stroke={ns.glow || (selectedNodes?.includes(node.id) ? '#00d4ff' : 'rgba(100,116,139,0.6)')}
              strokeWidth={ns.glow || selectedNodes?.includes(node.id) ? 2.5 : 1.5}
              style={{
                transition: 'fill 0.3s, stroke 0.3s',
                filter: ns.glow ? `drop-shadow(0 0 8px ${ns.glow})` : undefined,
              }}
            />
            {}
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fontWeight="700"
              fontFamily="'Inter', sans-serif"
              fill={COLORS.nodeText}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {node.label ?? node.id}
            </text>
            {}
            {distLabel !== null && (
              <text
                y={-NODE_RADIUS - 8}
                textAnchor="middle"
                fontSize="10"
                fontFamily="'JetBrains Mono', monospace"
                fill={distEntry?.settled ? '#a855f7' : '#00d4ff'}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {distLabel}
              </text>
            )}
          </g>
        );
      })}
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; r: ${NODE_RADIUS + 6}; }
          50%       { opacity: 0.8; r: ${NODE_RADIUS + 10}; }
        }
      `}</style>
    </svg>
  );
}
