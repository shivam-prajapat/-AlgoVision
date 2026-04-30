# AlgoVision — Algorithm Visualization Platform

A professional educational tool for visualizing **searching**, **graph traversal**, and **weighted-graph** algorithms. The core algorithm logic is implemented in **C++** (compiled to WebAssembly via Emscripten), while the frontend is built with **React + Vite**.

---

## Algorithms Supported

| Category | Algorithm | C++ Core |
|---|---|---|
| Array Search | Linear Search | ✅ (WASM) |
| Array Search | Binary Search | ✅ (WASM) |
| Graph Traversal | Depth First Search | ✅ (WASM) |
| Graph Traversal | Breadth First Search | ✅ (WASM) |
| Weighted Graph | **Dijkstra's Shortest Path** | ✅ JS (mirrors C++) |
| Weighted Graph | **Kruskal's MST** | ✅ JS (mirrors C++) |

> The Dijkstra and Kruskal JS generators are 1:1 mirrors of `src/algorithms/cpp/dijkstra_kruskal.cpp`. Compile with Emscripten to swap in the WASM version.

---

## Project Structure

```
-AlgoVision/
├── src/
│   ├── algorithms/
│   │   ├── cpp/
│   │   │   ├── algorithms.cpp          # Linear, Binary, DFS, BFS (WASM)
│   │   │   └── dijkstra_kruskal.cpp    # Dijkstra + Kruskal C++ core
│   │   ├── linearSearch.js             # JS generator (WASM fallback)
│   │   ├── binarySearch.js
│   │   ├── dfs.js
│   │   ├── bfs.js
│   │   ├── dijkstra.js                 # Dijkstra JS generator + path reconstruction
│   │   ├── kruskal.js                  # Kruskal JS generator with DSU class
│   │   ├── wasmAdapter.js              # WASM module loader
│   │   └── index.js
│   ├── components/
│   │   ├── GraphCanvas.jsx             # SVG interactive graph editor
│   │   ├── GraphControlPanel.jsx       # Left panel — graph edit controls
│   │   ├── GraphInfoPanel.jsx          # Right panel — dist table, PQ, MST, DSU
│   │   ├── GraphView.jsx               # Orchestrates Dijkstra/Kruskal mode
│   │   ├── Grid.jsx                    # Array/grid visualization
│   │   ├── ControlPanel.jsx            # Timeline controls for search algos
│   │   ├── InfoPanel.jsx               # Info panel for search algos
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx                 # Algorithm selector (all 6 algorithms)
│   │   └── LoadingScreen.jsx
│   ├── hooks/
│   │   ├── useVisualization.js         # Hook for array/grid algorithm animation
│   │   └── useGraphVisualization.js    # Hook for weighted-graph animation
│   ├── wasm/
│   │   ├── algorithms.js               # Compiled WASM JS glue
│   │   └── algorithms.wasm             # Compiled WASM binary
│   ├── utils/
│   │   └── gridUtils.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── src/algorithms/cpp/dijkstra_kruskal.cpp
└── package.json
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:5173
```

---

## Compiling the C++ Core to WASM (Optional)

The JS generators are already functional without WASM. To compile the full C++ core:

```bash
# Install Emscripten (one-time)
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh  # Windows: emsdk_env.bat

# Compile searching algorithms
em++ -O2 --bind -s MODULARIZE=1 -s EXPORT_NAME="AlgoModule" \
     -s ALLOW_MEMORY_GROWTH=1 \
     src/algorithms/cpp/algorithms.cpp \
     -o src/wasm/algorithms.js

# Compile graph algorithms (Dijkstra + Kruskal)
em++ -O2 --bind -s MODULARIZE=1 -s EXPORT_NAME="GraphAlgorithms" \
     -s ALLOW_MEMORY_GROWTH=1 \
     src/algorithms/cpp/dijkstra_kruskal.cpp \
     -o src/wasm/graph_algorithms.js
```

---

## Features

### Graph Visualization (Dijkstra & Kruskal)
- **Interactive SVG canvas** — click to add nodes, select two nodes to add a weighted edge
- **Drag nodes** to reposition them
- **Right-click** a node to delete it and its edges
- **Directed / undirected** toggle
- **Preset graphs** — Simple (5 nodes), Medium (7 nodes), Kruskal Demo
- **Random graph** generator

### Dijkstra Visualization
- 🟠 Start node highlighted in amber
- 🟣 Settled (finalized) nodes in purple
- 🔵 Active edge being examined in cyan
- 🟢 Improved distance edge in green
- Live **distance table** with dist, previous node, settled status
- Live **priority queue** snapshot
- **Shortest paths** display after completion

### Kruskal Visualization
- **Sorted edge list** with accept ✓ / reject ✗ status
- **DSU parent array** visualization (root nodes highlighted)
- **MST edges** in glowing green on canvas
- **Rejected edges** shown in red (would-form-cycle)
- **MST cost** running total

### Common Controls
- ▶ Play / ⏸ Pause / ▶ Resume
- ⏭ Step-by-step mode
- ↺ Reset
- Speed slider (Slow ↔ Fast)

---

## Architecture

```
User Interaction (React UI)
        ↓
useGraphVisualization hook
        ↓
JS Generator (dijkstra.js / kruskal.js)
        ↓   [mirrors]
C++ Core (dijkstra_kruskal.cpp)  →  WASM (optional swap-in)
        ↓
Step Objects { type, explanation, distTable, pqState, ... }
        ↓
GraphCanvas + GraphInfoPanel (render state)
```

Each algorithm step is a plain JS object with a `type` field and all relevant state snapshots needed to render the visualization, making it trivial to add new algorithms later.
