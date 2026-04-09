import { getWasmModule } from './wasmAdapter';

/**
 * Binary Search Algorithm — Generator-based step visualization
 * Now uses C++ WebAssembly backend to compute steps
 */
export function* binarySearch(array, target) {
  const Module = getWasmModule();
  const steps = Module.runBinarySearch(array, target);
  
  for (let i = 0; i < steps.length; i++) {
    yield steps[i];
  }
}

export const binarySearchInfo = {
  name: 'Binary Search',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(1)',
  bestCase: 'O(1)',
  worstCase: 'O(log n)',
  type: 'array',
  description: 'Divides the sorted array in half repeatedly, eliminating half of the remaining elements each step. Much faster than linear search for sorted data.',
  icon: '⚡',
};
