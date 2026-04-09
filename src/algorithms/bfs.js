import { getWasmModule } from './wasmAdapter';

/**
 * Breadth First Search — Generator-based step visualization on a 2D grid
 * Now uses C++ WebAssembly backend to compute steps
 */
export function* bfs(grid, start, end) {
  const Module = getWasmModule();
  const steps = Module.runBFS(grid, start, end);
  
  for (let i = 0; i < steps.length; i++) {
    yield steps[i];
  }
}

export const bfsInfo = {
  name: 'Breadth First Search',
  timeComplexity: 'O(V + E)',
  spaceComplexity: 'O(V)',
  bestCase: 'O(1)',
  worstCase: 'O(V + E)',
  type: 'graph',
  description: 'Explores all neighbors at the current depth before moving to nodes at the next depth level. Uses a queue (FIFO). Guarantees the shortest path in unweighted graphs.',
  icon: '🌐',
};
