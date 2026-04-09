$ErrorActionPreference = "Stop"

# Load the Emscripten environment
if (Test-Path ".\emsdk\emsdk_env.ps1") {
    . .\emsdk\emsdk_env.ps1
} else {
    Write-Host "WARNING: emsdk_env.ps1 not found. Make sure emsdk is installed and activated."
}

# Create output directory
if (-Not (Test-Path ".\src\wasm")) {
    New-Item -ItemType Directory -Force -Path ".\src\wasm" | Out-Null
}

Write-Host "Compiling src/algorithms/cpp/algorithms.cpp to WebAssembly..."

# Run emcc with embind
emcc .\src\algorithms\cpp\algorithms.cpp `
    -o .\src\wasm\algorithms.js `
    -O3 `
    -s WASM=1 `
    -s EXPORT_ES6=1 `
    -s MODULARIZE=1 `
    -s EXPORT_NAME="createModule" `
    -s ALLOW_MEMORY_GROWTH=1 `
    -lembind

Write-Host "✅ WebAssembly compilation successful! Output placed in src/wasm/"
