let wasmModule = null;
let initPromise = null;

export async function initWasm() {
  if (wasmModule) return wasmModule;
  if (initPromise) return initPromise;
  
  initPromise = new Promise(async (resolve, reject) => {
    try {
      // WebAssembly output from public folder
      const { default: initFn } = await import('/wasm/algorithms.js');
      const instance = await initFn();
      wasmModule = instance;
      resolve(instance);
    } catch (err) {
      console.error("WASM initialization error:", err);
      reject(err);
    }
  });
  return initPromise;
}

export function getWasmModule() {
  if (!wasmModule) {
    throw new Error("WASM module not initialized.");
  }
  return wasmModule;
}
