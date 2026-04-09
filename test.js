import { initWasm, getWasmModule } from './src/algorithms/wasmAdapter.js';

async function testDFS() {
  try {
    console.log("Initializing WASM...");
    await initWasm();
    const Module = getWasmModule();
    console.log("WASM Initialized", !!Module);

    // Create a 15x30 grid of 0s
    const grid = Array.from({ length: 15 }, () => Array(30).fill(0));
    const start = [7, 1];
    const end = [7, 28];

    console.log("Running DFS...");
    const steps = Module.runDFS(grid, start, end);
    console.log("Returned steps object:", steps);
    console.log("Length:", steps.length);
    console.log("Type of steps:", typeof steps);
    
    // Inspect elements
    if (steps.length > 0) {
      console.log("First step:", steps[0]);
    }
  } catch (e) {
    console.error("Test failed:", e);
  }
}

testDFS();
