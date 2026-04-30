# Error action preference removed to prevent early exit on stderr
$ProjectRoot = $PSScriptRoot

# ─── Locate emsdk ────────────────────────────────────────────────────────────
$EmsdkDir = Join-Path $ProjectRoot "emsdk"
if (-Not (Test-Path $EmsdkDir)) {
    Write-Host "❌ emsdk directory not found at $EmsdkDir"
    Write-Host "   Run: git clone https://github.com/emscripten-core/emsdk.git"
    exit 1
}

# ─── Activate latest WASM toolchain ──────────────────────────────────────────
Write-Host "Activating Emscripten toolchain..."
Push-Location $EmsdkDir
& ".\emsdk.bat" install latest 2>&1 | Write-Host
& ".\emsdk.bat" activate latest 2>&1 | Write-Host

# Source environment into current PowerShell session
$envScript = Join-Path $EmsdkDir "emsdk_env.ps1"
if (Test-Path $envScript) {
    . $envScript
} else {
    # Manually add upstream/emscripten to PATH
    $emBin = Get-ChildItem -Path $EmsdkDir -Recurse -Filter "emcc.bat" -ErrorAction SilentlyContinue |
             Select-Object -First 1
    if ($emBin) {
        $env:PATH = "$($emBin.DirectoryName);$env:PATH"
    }
}
Pop-Location

# ─── Verify emcc is available ────────────────────────────────────────────────
$emcc = Get-Command emcc -ErrorAction SilentlyContinue
$emplus = Get-Command em++ -ErrorAction SilentlyContinue

if (-not $emcc -and -not $emplus) {
    # Try locating emcc.bat manually
    $emccBat = Get-ChildItem -Path $EmsdkDir -Recurse -Filter "emcc.bat" -ErrorAction SilentlyContinue |
               Select-Object -First 1
    if ($emccBat) {
        $env:PATH = "$($emccBat.DirectoryName);$env:PATH"
        Write-Host "Added $($emccBat.DirectoryName) to PATH"
    } else {
        Write-Host "❌ emcc not found. Is Emscripten fully installed?"
        exit 1
    }
}

# ─── Compile ──────────────────────────────────────────────────────────────────
$SrcFile = Join-Path $ProjectRoot "src\algorithms\cpp\algorithms.cpp"
$OutDir  = Join-Path $ProjectRoot "src\wasm"
$OutFile = Join-Path $OutDir "algorithms.js"

if (-Not (Test-Path $OutDir)) {
    New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
}

Write-Host ""
Write-Host "Compiling $SrcFile → $OutFile ..."

emcc $SrcFile `
    -o $OutFile `
    -O3 `
    -s WASM=1 `
    -s EXPORT_ES6=1 `
    -s MODULARIZE=1 `
    -s "EXPORT_NAME='createModule'" `
    -s ALLOW_MEMORY_GROWTH=1 `
    -lembind

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ WebAssembly compiled successfully!"
    Write-Host "   Output: $OutFile"
    Write-Host "   Output: $(Join-Path $OutDir 'algorithms.wasm')"
} else {
    Write-Host "❌ Compilation failed. Check the error messages above."
    exit $LASTEXITCODE
}
