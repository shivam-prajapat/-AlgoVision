import { useCallback, useRef, useState } from 'react';
export function useGraphVisualization() {
  const [isRunning,  setIsRunning]  = useState(false);
  const [isPaused,   setIsPaused]   = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [stepCount,  setStepCount]  = useState(0);
  const [currentStep, setCurrentStep] = useState(null);
  const [distTable,    setDistTable]    = useState([]);
  const [pqState,      setPqState]      = useState([]);
  const [settledNodes, setSettledNodes] = useState(new Set());
  const [activeEdge,   setActiveEdge]   = useState(null);
  const [finalDistances, setFinalDistances] = useState(null);
  const [prevArray,    setPrevArray]    = useState(null);
  const [sortedEdges,      setSortedEdges]      = useState([]);
  const [mstEdgeSet,       setMstEdgeSet]       = useState(new Set());
  const [rejectedEdgeSet,  setRejectedEdgeSet]  = useState(new Set());
  const [activeKruskalEdge, setActiveKruskalEdge] = useState(null);
  const [dsuState,     setDsuState]     = useState([]);
  const [mstCost,      setMstCost]      = useState(0);
  const [examineEdgeIdx, setExamineEdgeIdx] = useState(-1);
  const generatorRef  = useRef(null);
  const timeoutRef    = useRef(null);
  const speedRef      = useRef(500);
  const isPausedRef   = useRef(false);
  const clearState = useCallback(() => {
    setIsRunning(false); setIsPaused(false); setIsComplete(false);
    setStepCount(0); setCurrentStep(null);
    setDistTable([]); setPqState([]); setSettledNodes(new Set());
    setActiveEdge(null); setFinalDistances(null); setPrevArray(null);
    setSortedEdges([]); setMstEdgeSet(new Set()); setRejectedEdgeSet(new Set());
    setActiveKruskalEdge(null); setDsuState([]); setMstCost(0); setExamineEdgeIdx(-1);
  }, []);
  const processStep = useCallback((step) => {
    setStepCount(c => c + 1);
    setCurrentStep(step);
    if (step.distTable) setDistTable(step.distTable);
    if (step.pqState)   setPqState(step.pqState);
    switch (step.type) {
      case 'init':
        if (step.sortedEdges) setSortedEdges(step.sortedEdges);
        if (step.dsuState)    setDsuState(step.dsuState);
        break;
      case 'settle':
        setSettledNodes(prev => new Set(prev).add(step.node));
        setActiveEdge(null);
        break;
      case 'relax_check':
        setActiveEdge({ fromNode: step.fromNode, toNode: step.toNode, type: 'check' });
        break;
      case 'relax':
        setActiveEdge({ fromNode: step.fromNode, toNode: step.toNode, type: 'relax' });
        break;
      case 'examine':
        if (step.sortedEdges) setSortedEdges(step.sortedEdges);
        if (step.dsuState)    setDsuState(step.dsuState);
        setExamineEdgeIdx(step.edgeIdx ?? -1);
        setActiveKruskalEdge({ u: step.u, v: step.v, w: step.w, status: 'examine' });
        setMstCost(step.mstCost ?? 0);
        if (step.mstEdges) setMstEdgeSet(new Set(step.mstEdges.map(e => `${e.u}-${e.v}`)));
        break;
      case 'accept':
        if (step.sortedEdges) setSortedEdges(step.sortedEdges);
        if (step.dsuState)    setDsuState(step.dsuState);
        setExamineEdgeIdx(step.edgeIdx ?? -1);
        setActiveKruskalEdge({ u: step.u, v: step.v, w: step.w, status: 'accept' });
        setMstCost(step.mstCost ?? 0);
        if (step.mstEdges) setMstEdgeSet(new Set(step.mstEdges.map(e => `${e.u}-${e.v}`)));
        break;
      case 'reject':
        if (step.sortedEdges) setSortedEdges(step.sortedEdges);
        if (step.dsuState)    setDsuState(step.dsuState);
        setExamineEdgeIdx(step.edgeIdx ?? -1);
        setActiveKruskalEdge({ u: step.u, v: step.v, w: step.w, status: 'reject' });
        setMstCost(step.mstCost ?? 0);
        setRejectedEdgeSet(prev => new Set(prev).add(`${step.u}-${step.v}`));
        break;
      case 'done':
        if (step.distances) setFinalDistances(step.distances);
        if (step.prevArray) setPrevArray(step.prevArray);
        if (step.dsuState)  setDsuState(step.dsuState);
        if (step.mstEdges)  setMstEdgeSet(new Set(step.mstEdges.map(e => `${e.u}-${e.v}`)));
        if (step.mstCost !== undefined) setMstCost(step.mstCost);
        setActiveEdge(null);
        setActiveKruskalEdge(null);
        setExamineEdgeIdx(-1);
        setIsComplete(true);
        setIsRunning(false);
        break;
      default: break;
    }
  }, []);
  const runLoopRef = useRef(null);
  runLoopRef.current = () => {
    if (!generatorRef.current || isPausedRef.current) return;
    try {
      const next = generatorRef.current.next();
      if (next.done) { setIsRunning(false); setIsComplete(true); return; }
      processStep(next.value);
      if (next.value.type === 'done') { setIsRunning(false); return; }
      timeoutRef.current = setTimeout(() => runLoopRef.current?.(), speedRef.current);
    } catch (e) {
      console.error('Graph viz error:', e);
      setIsRunning(false);
    }
  };
  const start = useCallback((generator) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    clearState();
    generatorRef.current = generator;
    isPausedRef.current  = false;
    setIsRunning(true);
    setIsPaused(false);
    timeoutRef.current = setTimeout(() => runLoopRef.current?.(), 100);
  }, [clearState]);
  const pause = useCallback(() => {
    isPausedRef.current = true;
    setIsPaused(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);
  const resume = useCallback(() => {
    isPausedRef.current = false;
    setIsPaused(false);
    timeoutRef.current = setTimeout(() => runLoopRef.current?.(), speedRef.current);
  }, []);
  const step = useCallback(() => {
    if (!generatorRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    isPausedRef.current = true;
    setIsPaused(true);
    const next = generatorRef.current.next();
    if (next.done) { setIsRunning(false); setIsComplete(true); return; }
    processStep(next.value);
    if (next.value.type === 'done') setIsRunning(false);
  }, [processStep]);
  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    generatorRef.current = null;
    isPausedRef.current  = false;
    clearState();
  }, [clearState]);
  const setSpeed = useCallback((ms) => { speedRef.current = ms; }, []);
  return {
    isRunning, isPaused, isComplete,
    stepCount, currentStep,
    start, pause, resume, step, reset, setSpeed,
    distTable, pqState, settledNodes, activeEdge,
    finalDistances, prevArray,
    sortedEdges, mstEdgeSet, rejectedEdgeSet,
    activeKruskalEdge, dsuState, mstCost, examineEdgeIdx,
    shortestPath: [],
  };
}
