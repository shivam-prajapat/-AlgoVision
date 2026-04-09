import { getWasmModule } from './wasmAdapter';

/**
 * Depth First Search — Generator-based step visualization on a 2D grid
 * Now uses C++ WebAssembly backend to compute steps
 */
export function* dfs(grid, start, end) {
  const Module = getWasmModule();
  const steps = Module.runDFS(grid, start, end);
  
  for (let i = 0; i < steps.length; i++) {
    yield steps[i];
  }
}

export const dfsInfo = {
  name: 'Depth First Search',
  timeComplexity: 'O(V + E)',
  spaceComplexity: 'O(V)',
  bestCase: 'O(1)',
  worstCase: 'O(V + E)',
  type: 'graph',
  description: 'Explores as deep as possible along each branch before backtracking. Uses a stack (LIFO). Good for finding any path but not guaranteed shortest.',
  icon: '🌊',
};
