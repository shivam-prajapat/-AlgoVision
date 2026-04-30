let wasmModule = null;
let initPromise = null;
export async function initWasm() {
  if (wasmModule) return wasmModule;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      const mod = await import('../wasm/algorithms.js');
      const factory = mod.default ?? mod;
      if (typeof factory !== 'function') {
        console.info('WASM not compiled yet — using pure-JS fallback (run build_wasm.ps1 to enable C++ mode)');
        return null;
      }
      wasmModule = await factory();
      return wasmModule;
    } catch (e) {
      console.info('WASM unavailable — using pure-JS fallback:', e.message);
      return null;
    }
  })();
  return initPromise;
}
function getWasm() { return wasmModule; }
function toArray(wasmVal) {
  if (Array.isArray(wasmVal)) return wasmVal;
  const out = [];
  const len = wasmVal.length ?? wasmVal.size?.() ?? 0;
  for (let i = 0; i < len; i++) out.push(wasmVal[i]);
  return out;
}
function* stepsGenerator(steps) {
  for (let i = 0; i < steps.length; i++) yield steps[i];
}
export function linearSearch(array, target) {
  const wasm = getWasm();
  if (wasm?.runLinearSearch) return stepsGenerator(toArray(wasm.runLinearSearch(array, target)));
  return stepsGenerator(_linearSearchJS(array, target));
}
function _linearSearchJS(array, target) {
  const steps = [];
  for (let i = 0; i < array.length; i++) {
    steps.push({ type: 'visit', index: i, indices: { current: i }, explanation: `Checking index ${i} (value=${array[i]})` });
    if (array[i] === target) { steps.push({ type: 'found', index: i, indices: { current: i }, explanation: ` Found ${target} at index ${i}` }); return steps; }
    steps.push({ type: 'compare', index: i, indices: { current: i }, explanation: `${array[i]} ≠ ${target}, move next` });
  }
  steps.push({ type: 'not_found', index: -1, indices: {}, explanation: ` ${target} not found` });
  return steps;
}
export function binarySearch(array, target) {
  const wasm = getWasm();
  if (wasm?.runBinarySearch) return stepsGenerator(toArray(wasm.runBinarySearch(array, target)));
  return stepsGenerator(_binarySearchJS(array, target));
}
function _binarySearchJS(array, target) {
  const steps = []; let left = 0, right = array.length - 1;
  while (left <= right) {
    steps.push({ type: 'range', indices: { left, right }, explanation: `Search [${left}, ${right}]` });
    const mid = left + Math.floor((right - left) / 2);
    steps.push({ type: 'visit', index: mid, indices: { left, right, mid }, explanation: `Mid=${mid} (value=${array[mid]})` });
    if (array[mid] === target) { steps.push({ type: 'found', index: mid, indices: { left, right, mid }, explanation: ` Found ${target} at index ${mid}` }); return steps; }
    if (array[mid] < target) { steps.push({ type: 'compare', index: mid, indices: { left, right, mid }, explanation: `${array[mid]} < ${target}, search right` }); left = mid + 1; }
    else { steps.push({ type: 'compare', index: mid, indices: { left, right, mid }, explanation: `${array[mid]} > ${target}, search left` }); right = mid - 1; }
  }
  steps.push({ type: 'not_found', index: -1, indices: {}, explanation: ` ${target} not found` });
  return steps;
}
export function dfs(grid, start, end) {
  const wasm = getWasm();
  if (wasm?.runDFS) return stepsGenerator(toArray(wasm.runDFS(grid, start, end)));
  return stepsGenerator(_dfsJS(grid, start, end));
}
function _dfsJS(grid, start, end) {
  const rows = grid.length, cols = grid[0].length;
  const vis = Array.from({length:rows},()=>Array(cols).fill(false));
  const par = Array.from({length:rows},()=>Array(cols).fill(null));
  const stk = [start]; const steps = [];
  const dx=[-1,0,1,0], dy=[0,1,0,-1];
  steps.push({type:'start',row:start[0],col:start[1],explanation:`DFS from (${start[0]},${start[1]})`});
  while (stk.length) {
    const [r,c] = stk.pop();
    if (r<0||r>=rows||c<0||c>=cols||vis[r][c]||grid[r][c]===1) continue;
    vis[r][c]=true;
    steps.push({type:'visit',row:r,col:c,explanation:`Visit (${r},${c}) stack=${stk.length}`});
    if (r===end[0]&&c===end[1]) {
      const path=[]; let cur=[r,c];
      while(cur){path.unshift(cur); cur=par[cur[0]]?.[cur[1]];}
      path.forEach((p,i)=>steps.push({type:'path',row:p[0],col:p[1],explanation:`Path ${i+1}/${path.length}`}));
      steps.push({type:'found',row:r,col:c,path,explanation:` Path found! Length=${path.length}`}); return steps;
    }
    for (let i=3;i>=0;i--) {
      const nr=r+dx[i], nc=c+dy[i];
      if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&!vis[nr][nc]&&grid[nr][nc]!==1){
        stk.push([nr,nc]); if(!par[nr][nc]) par[nr][nc]=[r,c];
      }
    }
  }
  steps.push({type:'not_found',row:-1,col:-1,explanation:' No path found'}); return steps;
}
export function bfs(grid, start, end) {
  const wasm = getWasm();
  if (wasm?.runBFS) return stepsGenerator(toArray(wasm.runBFS(grid, start, end)));
  return stepsGenerator(_bfsJS(grid, start, end));
}
function _bfsJS(grid, start, end) {
  const rows = grid.length, cols = grid[0].length;
  const vis = Array.from({length:rows},()=>Array(cols).fill(false));
  const par = Array.from({length:rows},()=>Array(cols).fill(null));
  const queue = [start]; vis[start[0]][start[1]]=true;
  const steps = []; const dx=[-1,0,1,0], dy=[0,1,0,-1];
  steps.push({type:'start',row:start[0],col:start[1],explanation:`BFS from (${start[0]},${start[1]})`});
  while (queue.length) {
    const [r,c] = queue.shift();
    steps.push({type:'visit',row:r,col:c,explanation:`Visit (${r},${c}) queue=${queue.length}`});
    if (r===end[0]&&c===end[1]) {
      const path=[]; let cur=[r,c];
      while(cur){path.unshift(cur); cur=par[cur[0]]?.[cur[1]];}
      path.forEach((p,i)=>steps.push({type:'path',row:p[0],col:p[1],explanation:`Path ${i+1}/${path.length}`}));
      steps.push({type:'found',row:r,col:c,path,explanation:` Shortest path found! Length=${path.length}`}); return steps;
    }
    for (let i=0;i<4;i++) {
      const nr=r+dx[i], nc=c+dy[i];
      if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&!vis[nr][nc]&&grid[nr][nc]!==1){
        vis[nr][nc]=true; par[nr][nc]=[r,c]; queue.push([nr,nc]);
        steps.push({type:'enqueue',row:nr,col:nc,explanation:`Enqueue (${nr},${nc})`});
      }
    }
  }
  steps.push({type:'not_found',row:-1,col:-1,explanation:' No path found'}); return steps;
}
export function dijkstra(numNodes, adjList, startNode) {
  const wasm = getWasm();
  if (wasm?.runDijkstra) {
    return stepsGenerator(toArray(wasm.runDijkstra(numNodes, adjList, startNode)));
  }
  return stepsGenerator(_dijkstraJS(numNodes, adjList, startNode));
}
function _dijkstraJS(numNodes, adjList, startNode) {
  const INF = Infinity;
  const dist = Array(numNodes).fill(INF);
  const prev = Array(numNodes).fill(-1);
  const settled = Array(numNodes).fill(false);
  dist[startNode] = 0;
  const pqSnap = [{ node: startNode, dist: 0 }];
  const pq = [{ node: startNode, dist: 0 }];
  const steps = [];
  const mkDist = () => Array.from({ length: numNodes }, (_, i) => ({
    node: i, dist: dist[i] === INF ? -1 : dist[i], prev: prev[i], settled: settled[i]
  }));
  const mkPQ = () => [...pqSnap].sort((a, b) => a.dist - b.dist);
  steps.push({ type: 'init', startNode, distTable: mkDist(), pqState: mkPQ(),
    explanation: `Init: dist[${startNode}]=0, all others=∞` });
  while (pq.length) {
    pq.sort((a, b) => a.dist - b.dist);
    const { node: u, dist: d } = pq.shift();
    const idx = pqSnap.findIndex(e => e.node === u && e.dist === d);
    if (idx !== -1) pqSnap.splice(idx, 1);
    if (d > dist[u] || settled[u]) continue;
    settled[u] = true;
    steps.push({ type: 'settle', node: u, dist: dist[u], distTable: mkDist(), pqState: mkPQ(),
      explanation: `Settle node ${u} (dist=${dist[u]})` });
    for (const [v, w] of adjList[u]) {
      if (settled[v]) continue;
      steps.push({ type: 'relax_check', fromNode: u, toNode: v, weight: w,
        currentDist: dist[v] === INF ? -1 : dist[v], newDist: dist[u] + w,
        distTable: mkDist(), pqState: mkPQ(),
        explanation: `Check edge ${u}→${v} (w=${w}) new=${dist[u] + w}` });
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w; prev[v] = u;
        const ex = pqSnap.find(e => e.node === v);
        if (ex) ex.dist = dist[v]; else pqSnap.push({ node: v, dist: dist[v] });
        pq.push({ node: v, dist: dist[v] });
        steps.push({ type: 'relax', fromNode: u, toNode: v, weight: w, newDist: dist[v],
          distTable: mkDist(), pqState: mkPQ(),
          explanation: ` Improved dist[${v}]=${dist[v]} via ${u}` });
      }
    }
  }
  steps.push({ type: 'done', distTable: mkDist(), pqState: mkPQ(),
    distances: dist.map(d => d === INF ? -1 : d), prevArray: [...prev],
    explanation: ' Dijkstra complete!' });
  return steps;
}
export function kruskal(numNodes, edges) {
  const wasm = getWasm();
  if (wasm?.runKruskal) {
    return stepsGenerator(toArray(wasm.runKruskal(numNodes, edges)));
  }
  return stepsGenerator(_kruskalJS(numNodes, edges));
}
function _kruskalJS(numNodes, edges) {
  const sorted = [...edges].sort((a, b) => a[2] - b[2]);
  const par = Array.from({ length: numNodes }, (_, i) => i);
  const rnk = Array(numNodes).fill(0);
  const steps = [];
  const mst = [];
  let mstCost = 0;
  function find(x) { return par[x] === x ? x : (par[x] = find(par[x])); }
  function unite(x, y) {
    const px = find(x), py = find(y);
    if (px === py) return false;
    if (rnk[px] < rnk[py]) { par[px] = py; } else { par[py] = px; if (rnk[px] === rnk[py]) rnk[px]++; }
    return true;
  }
  const mkSorted = () => sorted.map(([u, v, w]) => ({ u, v, w }));
  const mkDSU = () => [...par];
  const mkMST = () => mst.map(([u, v, w]) => ({ u, v, w }));
  steps.push({ type: 'init', sortedEdges: mkSorted(), dsuState: mkDSU(), mstEdges: mkMST(), mstCost: 0,
    explanation: `Kruskal init: ${sorted.length} edges sorted by weight` });
  for (let i = 0; i < sorted.length; i++) {
    const [u, v, w] = sorted[i];
    const pu = find(u), pv = find(v);
    steps.push({ type: 'examine', edgeIdx: i, u, v, w, rootU: pu, rootV: pv,
      sortedEdges: mkSorted(), dsuState: mkDSU(), mstEdges: mkMST(), mstCost,
      explanation: `Examine (${u}—${v}, w=${w}) root[${u}]=${pu}, root[${v}]=${pv}` });
    if (unite(u, v)) {
      mst.push([u, v, w]); mstCost += w;
      steps.push({ type: 'accept', edgeIdx: i, u, v, w,
        sortedEdges: mkSorted(), dsuState: mkDSU(), mstEdges: mkMST(), mstCost,
        explanation: ` Accept (${u}—${v}, w=${w}) MST cost=${mstCost}` });
      if (mst.length === numNodes - 1) break;
    } else {
      steps.push({ type: 'reject', edgeIdx: i, u, v, w,
        sortedEdges: mkSorted(), dsuState: mkDSU(), mstEdges: mkMST(), mstCost,
        explanation: ` Reject (${u}—${v}, w=${w}) — would form cycle` });
    }
  }
  steps.push({ type: 'done', sortedEdges: mkSorted(), dsuState: mkDSU(), mstEdges: mkMST(), mstCost,
    explanation: ` Kruskal done! MST cost=${mstCost}` });
  return steps;
}
export function reconstructPath(prevArray, startNode, targetNode) {
  const path = [];
  let cur = targetNode;
  while (cur !== -1 && cur !== undefined) {
    path.unshift(cur);
    if (cur === startNode) break;
    cur = prevArray[cur];
  }
  return path[0] === startNode ? path : [];
}
export const ALGO_META = {
  linear:   { name: 'Linear Search',       icon: '', timeComplexity: 'O(n)',           spaceComplexity: 'O(1)',     type: 'array',          category: 'Array Search',    description: 'Scans every element from left to right until the target is found. Simple but slow on large datasets.' },
  binary:   { name: 'Binary Search',       icon: '', timeComplexity: 'O(log n)',        spaceComplexity: 'O(1)',     type: 'array',          category: 'Array Search',    description: 'Halves the search space each step by comparing the target to the middle element. Requires a sorted array.' },
  dfs:      { name: 'Depth First Search',  icon: '', timeComplexity: 'O(V + E)',        spaceComplexity: 'O(V)',     type: 'graph',          category: 'Graph Traversal', description: 'Explores as far as possible along each branch before backtracking. Uses a stack (LIFO).' },
  bfs:      { name: 'Breadth First Search',icon: '', timeComplexity: 'O(V + E)',        spaceComplexity: 'O(V)',     type: 'graph',          category: 'Graph Traversal', description: 'Explores all neighbors level-by-level. Uses a queue (FIFO). Guarantees shortest path on unweighted graphs.' },
  dijkstra: { name: "Dijkstra's Algorithm",icon: '️', timeComplexity: 'O((V+E) log V)',  spaceComplexity: 'O(V)',     type: 'weighted-graph', category: 'Weighted Graph',  description: 'Finds shortest paths from a source node to all others. Uses a min-priority queue. Non-negative weights only.' },
  kruskal:  { name: "Kruskal's MST",       icon: '', timeComplexity: 'O(E log E)',      spaceComplexity: 'O(V + E)', type: 'weighted-graph', category: 'Weighted Graph',  description: 'Builds the Minimum Spanning Tree by greedily adding the smallest edge that does not form a cycle. Uses DSU.' },
};
