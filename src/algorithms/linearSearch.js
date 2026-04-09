import { getWasmModule } from './wasmAdapter';

/**
 * Linear Search Algorithm — Generator-based step visualization
 * Now uses C++ WebAssembly backend to compute steps
 */
export function* linearSearch(array, target) {
  const Module = getWasmModule();
  
  // Convert JS array to typed array for WASM (just a quick mapping, though embind handles JS arrays natively!)
  // Since we used emscripten::val, we can just pass the JS array directly!
  const steps = Module.runLinearSearch(array, target);
  
  // Yield each step computed by C++
  for (let i = 0; i < steps.length; i++) {
    yield steps[i];
  }
}

export const linearSearchInfo = {
  name: 'Linear Search',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  bestCase: 'O(1)',
  worstCase: 'O(n)',
  type: 'array',
  description: 'Sequentially checks each element of the list until the target is found or the list is exhausted. Simple but works on unsorted data.',
  icon: '🔍',
};
