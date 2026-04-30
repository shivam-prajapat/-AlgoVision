import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import LoadingScreen from "./components/LoadingScreen";
import Sidebar from "./components/Sidebar";
import Grid from "./components/Grid";
import GraphCanvas from "./components/GraphCanvas";
import ControlBar from "./components/ControlBar";
import InfoPanel from "./components/InfoPanel";
import GraphInfoPanel from "./components/GraphInfoPanel";
import { useVisualization } from "./hooks/useVisualization";
import { useGraphVisualization } from "./hooks/useGraphVisualization";
import {
  initWasm,
  linearSearch,
  binarySearch,
  dfs,
  bfs,
  dijkstra,
  kruskal,
} from "./algorithms/wasmAdapter";
import {
  generateRandomArray,
  generateSortedArray,
  generateRandomGrid,
  getDefaultPositions,
} from "./utils/gridUtils";
const DEFAULT_NODES = [
  { id: 0, x: 200, y: 150, label: "A" },
  { id: 1, x: 400, y: 80, label: "B" },
  { id: 2, x: 560, y: 210, label: "C" },
  { id: 3, x: 400, y: 350, label: "D" },
  { id: 4, x: 210, y: 300, label: "E" },
];
const DEFAULT_EDGES = [
  { id: 0, u: 0, v: 1, weight: 4 },
  { id: 1, u: 0, v: 4, weight: 2 },
  { id: 2, u: 1, v: 2, weight: 5 },
  { id: 3, u: 1, v: 4, weight: 1 },
  { id: 4, u: 2, v: 3, weight: 3 },
  { id: 5, u: 3, v: 4, weight: 8 },
  { id: 6, u: 2, v: 4, weight: 6 },
];
const NODE_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function buildAdjList(nodes, edges, directed) {
  const maxId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) : 0;
  const adj = Array.from({ length: maxId + 1 }, () => []);
  edges.forEach((e) => {
    if (e.u <= maxId && e.v <= maxId) {
      adj[e.u].push([e.v, e.weight]);
      if (!directed) adj[e.v].push([e.u, e.weight]);
    }
  });
  return adj;
}
function generateRandomGraph(n = 6) {
  const nodes = [];
  for (let i = 0; i < n; i++)
    nodes.push({
      id: i,
      x: 90 + Math.random() * 520,
      y: 70 + Math.random() * 300,
      label: NODE_LABELS[i],
    });
  const edges = [];
  let eid = 0;
  const perm = [...Array(n).keys()].sort(() => Math.random() - 0.5);
  for (let i = 1; i < perm.length; i++)
    edges.push({
      id: eid++,
      u: perm[i - 1],
      v: perm[i],
      weight: Math.ceil(Math.random() * 12) + 1,
    });
  for (let k = 0; k < Math.floor(n * 0.7); k++) {
    const a = Math.floor(Math.random() * n),
      b = Math.floor(Math.random() * n);
    if (
      a !== b &&
      !edges.find((e) => (e.u === a && e.v === b) || (e.u === b && e.v === a))
    )
      edges.push({
        id: eid++,
        u: a,
        v: b,
        weight: Math.ceil(Math.random() * 12) + 1,
      });
  }
  return { nodes, edges };
}
const ARRAY_ALGOS = new Set(["linear", "binary"]);
const GRID_ALGOS = new Set(["dfs", "bfs"]);
const GRAPH_ALGOS = new Set(["dijkstra", "kruskal"]);
export default function App() {
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [algo, setAlgo] = useState("linear");
  const [arrayData, setArrayData] = useState(() => generateRandomArray(20));
  const [gridData, setGridData] = useState(() => generateRandomGrid(15, 30));
  const [startPos, setStartPos] = useState([7, 1]);
  const [endPos, setEndPos] = useState([7, 28]);
  const [target, setTarget] = useState("");
  const [dataSize, setDataSize] = useState(20);
  const [speed, setSpeedState] = useState(500);
  const [nodes, setNodes] = useState(DEFAULT_NODES);
  const [edges, setEdges] = useState(DEFAULT_EDGES);
  const [directed, setDirected] = useState(false);
  const [startNode, setStartNode] = useState(0);
  const [editMode, setEditMode] = useState(null);
  const [pendingEdge, setPending] = useState(null);
  const [weightInput, setWeightInput] = useState(5);
  const nodeId = useRef(DEFAULT_NODES.length);
  const edgeId = useRef(DEFAULT_EDGES.length);
  const viz = useVisualization();
  const gviz = useGraphVisualization();
  const isArray = ARRAY_ALGOS.has(algo);
  const isGrid = GRID_ALGOS.has(algo);
  const isGraph = GRAPH_ALGOS.has(algo);
  useEffect(() => {
    initWasm().catch(console.warn);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("light", !darkMode);
  }, [darkMode]);
  const selectAlgo = useCallback(
    (id) => {
      if (viz.isRunning || gviz.isRunning) return;
      viz.reset();
      gviz.reset();
      setAlgo(id);
      setTarget("");
      setPending(null);
      setEditMode(null);
      if (id === "binary") setArrayData(generateSortedArray(dataSize));
      if (id === "linear") setArrayData(generateRandomArray(dataSize));
      if (GRID_ALGOS.has(id)) {
        const g = generateRandomGrid(15, 30);
        setGridData(g);
        const p = getDefaultPositions(15, 30);
        setStartPos(p.start);
        setEndPos(p.end);
      }
    },
    [viz, gviz, dataSize],
  );
  const handleStart = useCallback(() => {
    try {
      if (algo === "linear") {
        const t =
          parseInt(target) ||
          arrayData[Math.floor(Math.random() * arrayData.length)];
        setTarget(String(t));
        viz.start(linearSearch(arrayData, t));
      } else if (algo === "binary") {
        const t =
          parseInt(target) ||
          arrayData[Math.floor(Math.random() * arrayData.length)];
        setTarget(String(t));
        viz.start(binarySearch(arrayData, t));
      } else if (algo === "dfs") {
        viz.start(dfs(gridData, startPos, endPos));
      } else if (algo === "bfs") {
        viz.start(bfs(gridData, startPos, endPos));
      }
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  }, [algo, arrayData, gridData, startPos, endPos, target, viz]);
  const handleStep = useCallback(() => {
    if (!viz.isRunning && !viz.isComplete) {
      handleStart();
    } else {
      viz.step();
    }
  }, [viz, handleStart]);
  const handleGenerate = useCallback(() => {
    viz.reset();
    if (algo === "binary") setArrayData(generateSortedArray(dataSize));
    else if (algo === "linear") setArrayData(generateRandomArray(dataSize));
    else {
      const g = generateRandomGrid(15, 30);
      setGridData(g);
      const p = getDefaultPositions(15, 30);
      setStartPos(p.start);
      setEndPos(p.end);
    }
    setTarget("");
  }, [algo, dataSize, viz]);
  const handleCellClick = useCallback(
    (r, c) => {
      if (viz.isRunning) return;
      if (r === startPos[0] && c === startPos[1]) return;
      if (r === endPos[0] && c === endPos[1]) return;
      setGridData((prev) => {
        const g = prev.map((row) => [...row]);
        g[r][c] = g[r][c] === 1 ? 0 : 1;
        return g;
      });
    },
    [viz.isRunning, startPos, endPos],
  );
  const handleGraphStart = useCallback(() => {
    try {
      if (!nodes.length) return;
      const maxId = Math.max(...nodes.map((n) => n.id));
      const size = maxId + 1;
      if (algo === "dijkstra") {
        const adj = buildAdjList(nodes, edges, directed);
        let validStart = startNode;
        if (!nodes.find(n => n.id === validStart)) {
          validStart = nodes[0].id;
          setStartNode(validStart);
        }
        gviz.start(dijkstra(size, adj, validStart));
      } else {
        gviz.start(
          kruskal(
            size,
            edges.map((e) => [e.u, e.v, e.weight]),
          ),
        );
      }
    } catch (err) {
      console.error(err);
      alert(err.message || String(err));
    }
  }, [algo, nodes, edges, directed, startNode, gviz]);
  const handleGraphStep = useCallback(() => {
    if (!gviz.isRunning && !gviz.isComplete) {
      handleGraphStart();
    } else {
      gviz.step();
    }
  }, [gviz, handleGraphStart]);
  const handleCanvasClick = useCallback(
    (x, y) => {
      if (gviz.isRunning || editMode !== "addNode") return;
      const n = {
        id: nodeId.current++,
        x,
        y,
        label: NODE_LABELS[nodes.length % 26],
      };
      setNodes((prev) => [...prev, n]);
    },
    [gviz.isRunning, editMode, nodes.length],
  );
  const handleNodeClick = useCallback(
    (nid) => {
      if (gviz.isRunning || editMode !== "addEdge") return;
      if (pendingEdge === null) {
        setPending(nid);
        return;
      }
      if (pendingEdge === nid) {
        setPending(null);
        return;
      }
      if (
        !edges.find(
          (e) =>
            (e.u === pendingEdge && e.v === nid) ||
            (!directed && e.u === nid && e.v === pendingEdge),
        )
      ) {
        setEdges((prev) => [
          ...prev,
          { id: edgeId.current++, u: pendingEdge, v: nid, weight: weightInput },
        ]);
      }
      setPending(null);
    },
    [gviz.isRunning, editMode, pendingEdge, edges, directed, weightInput],
  );
  const handleNodeRightClick = useCallback(
    (nid) => {
      if (gviz.isRunning) return;
      setNodes((prev) => {
        const nextNodes = prev.filter((n) => n.id !== nid);
        if (startNode === nid) {
          setStartNode(nextNodes[0]?.id ?? 0);
        }
        return nextNodes;
      });
      setEdges((prev) => prev.filter((e) => e.u !== nid && e.v !== nid));
      if (pendingEdge === nid) setPending(null);
    },
    [gviz.isRunning, startNode, pendingEdge],
  );
  const handleNodeDrag = useCallback(
    (nid, x, y) => {
      if (gviz.isRunning) return;
      setNodes((prev) => prev.map((n) => (n.id === nid ? { ...n, x, y } : n)));
    },
    [gviz.isRunning],
  );
  const loadPreset = useCallback(
    (preset) => {
      gviz.reset();
      setNodes(preset.nodes);
      setEdges(preset.edges);
      nodeId.current = Math.max(...preset.nodes.map((n) => n.id)) + 1;
      edgeId.current = Math.max(...preset.edges.map((e) => e.id)) + 1;
      setStartNode(preset.nodes[0]?.id ?? 0);
      setPending(null);
    },
    [gviz],
  );
  const clearGraph = useCallback(() => {
    gviz.reset();
    setNodes([]);
    setEdges([]);
    nodeId.current = 0;
    edgeId.current = 0;
    setPending(null);
  }, [gviz]);
  const randomGraph = useCallback(() => {
    gviz.reset();
    const { nodes: rn, edges: re } = generateRandomGraph(6);
    setNodes(rn);
    setEdges(re);
    nodeId.current = rn.length;
    edgeId.current = re.length;
    setStartNode(0);
    setPending(null);
  }, [gviz]);
  const handleSpeed = useCallback(
    (ms) => {
      setSpeedState(ms);
      viz.setSpeed(ms);
      gviz.setSpeed(ms);
    },
    [viz, gviz],
  );
  const isRunning = isGraph ? gviz.isRunning : viz.isRunning;
  const isPaused = isGraph ? gviz.isPaused : viz.isPaused;
  const isComplete = isGraph ? gviz.isComplete : viz.isComplete;
  const stepCount = isGraph ? gviz.stepCount : viz.stepCount;
  const curStep = isGraph ? gviz.currentStep : viz.currentStep;
  const onPlay = isGraph ? handleGraphStart : handleStart;
  const onPause = isGraph ? gviz.pause : viz.pause;
  const onResume = isGraph ? gviz.resume : viz.resume;
  const onStep = isGraph ? handleGraphStep : handleStep;
  const onReset = isGraph ? gviz.reset : viz.reset;
  const PRESETS = {
    simple: {
      label: "Simple (5)",
      nodes: DEFAULT_NODES,
      edges: DEFAULT_EDGES,
    },
    medium: {
      label: "Medium (7)",
      nodes: [
        { id: 0, x: 120, y: 190, label: "0" },
        { id: 1, x: 280, y: 90, label: "1" },
        { id: 2, x: 440, y: 190, label: "2" },
        { id: 3, x: 580, y: 90, label: "3" },
        { id: 4, x: 580, y: 290, label: "4" },
        { id: 5, x: 440, y: 370, label: "5" },
        { id: 6, x: 280, y: 290, label: "6" },
      ],
      edges: [
        { id: 0, u: 0, v: 1, weight: 7 },
        { id: 1, u: 0, v: 6, weight: 14 },
        { id: 2, u: 1, v: 2, weight: 10 },
        { id: 3, u: 1, v: 6, weight: 9 },
        { id: 4, u: 2, v: 3, weight: 15 },
        { id: 5, u: 2, v: 4, weight: 11 },
        { id: 6, u: 2, v: 6, weight: 2 },
        { id: 7, u: 3, v: 4, weight: 6 },
        { id: 8, u: 4, v: 5, weight: 9 },
        { id: 9, u: 5, v: 6, weight: 14 },
      ],
    },
  };
  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      <div className={`app-shell ${darkMode ? "" : "light"}`}>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <div className="app-body">
          {}
          <Sidebar
            selectedAlgorithm={algo}
            onSelectAlgorithm={selectAlgo}
            isRunning={isRunning}
            isGraph={isGraph}
            editMode={editMode}
            pendingEdge={pendingEdge}
            weightInput={weightInput}
            directed={directed}
            startNode={startNode}
            nodes={nodes}
            edges={edges}
            onEditModeChange={(m) => {
              setEditMode(m);
              setPending(null);
            }}
            onWeightChange={setWeightInput}
            onDirectedToggle={() => !isRunning && setDirected((d) => !d)}
            onStartNodeChange={setStartNode}
            onLoadPreset={loadPreset}
            onClearGraph={clearGraph}
            onRandomGraph={randomGraph}
            presets={PRESETS}
            isArray={isArray}
            isGrid={isGrid}
            dataSize={dataSize}
            onSizeChange={(s) => {
              setDataSize(s);
              if (algo === "binary") setArrayData(generateSortedArray(s));
              else if (algo === "linear") setArrayData(generateRandomArray(s));
            }}
            onCustomArray={(arr) => {
              setDataSize(arr.length);
              setArrayData(arr);
            }}
            target={target}
            onTargetChange={setTarget}
            onGenerate={handleGenerate}
          />
          {}
          <div className="app-center">
            <div className="canvas-wrapper">
              {}
              {(isArray || isGrid) && (
                <Grid
                  algorithm={algo}
                  arrayData={isArray ? arrayData : undefined}
                  gridData={isGrid ? gridData : undefined}
                  visitedIndices={viz.visitedIndices}
                  visitedCells={viz.visitedCells}
                  pathCells={viz.pathCells}
                  foundIndex={viz.foundIndex}
                  currentStep={viz.currentStep}
                  isComplete={viz.isComplete}
                  startPos={isGrid ? startPos : undefined}
                  endPos={isGrid ? endPos : undefined}
                  onCellClick={isGrid ? handleCellClick : undefined}
                />
              )}
              {}
              {isGraph && (
                <GraphCanvas
                  nodes={nodes}
                  edges={edges}
                  directed={directed}
                  algorithm={algo}
                  startNode={startNode}
                  selectedNodes={pendingEdge !== null ? [pendingEdge] : []}
                  onNodeClick={handleNodeClick}
                  onCanvasClick={handleCanvasClick}
                  onNodeRightClick={handleNodeRightClick}
                  onNodeDrag={handleNodeDrag}
                  settledNodes={gviz.settledNodes}
                  activeEdge={gviz.activeEdge}
                  mstEdgeSet={gviz.mstEdgeSet}
                  rejectedEdgeSet={gviz.rejectedEdgeSet}
                  activeKruskalEdge={gviz.activeKruskalEdge}
                  distTable={gviz.distTable}
                  isRunning={gviz.isRunning}
                  isComplete={gviz.isComplete}
                />
              )}
              {}
              <AnimatePresence mode="wait">
                {curStep?.explanation && (
                  <motion.div
                    key={curStep.explanation}
                    className="step-toast"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {curStep.explanation}
                  </motion.div>
                )}
              </AnimatePresence>
              {}
              {isGraph && nodes.length === 0 && (
                <div className="empty-hint">
                  <span style={{ fontSize: 36 }}>️</span>
                  <p>
                    Select <strong>Add Node</strong> then click the canvas
                  </p>
                </div>
              )}
              {}
              {isGrid && !isRunning && !isComplete && (
                <div className="grid-hint"> Click cells to toggle walls</div>
              )}
            </div>
            {}
            <ControlBar
              isRunning={isRunning}
              isPaused={isPaused}
              isComplete={isComplete}
              stepCount={stepCount}
              speed={speed}
              onPlay={onPlay}
              onPause={onPause}
              onResume={onResume}
              onStep={onStep}
              onReset={onReset}
              onSpeedChange={handleSpeed}
              isArray={isArray}
              target={target}
              onTargetChange={setTarget}
              onCustomArray={(arr) => {
                setDataSize(arr.length);
                setArrayData(arr);
              }}
            />
          </div>
          {}
          <div className="app-info">
            {isGraph ? (
              <GraphInfoPanel
                algorithm={algo}
                currentStep={gviz.currentStep}
                stepCount={gviz.stepCount}
                isRunning={gviz.isRunning}
                isPaused={gviz.isPaused}
                isComplete={gviz.isComplete}
                nodes={nodes}
                edges={edges}
                distTable={gviz.distTable}
                pqState={gviz.pqState}
                settledNodes={gviz.settledNodes}
                finalDistances={gviz.finalDistances}
                prevArray={gviz.prevArray}
                startNode={startNode}
                sortedEdges={gviz.sortedEdges}
                mstEdgeSet={gviz.mstEdgeSet}
                rejectedEdgeSet={gviz.rejectedEdgeSet}
                dsuState={gviz.dsuState}
                mstCost={gviz.mstCost}
                examineEdgeIdx={gviz.examineEdgeIdx}
                activeKruskalEdge={gviz.activeKruskalEdge}
              />
            ) : (
              <InfoPanel
                algorithm={algo}
                currentStep={viz.currentStep}
                stepCount={viz.stepCount}
                isRunning={viz.isRunning}
                isPaused={viz.isPaused}
                isComplete={viz.isComplete}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
