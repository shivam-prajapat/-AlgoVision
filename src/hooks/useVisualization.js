import { useCallback, useRef, useState } from 'react';
export function useVisualization() {
  const [isRunning,      setIsRunning]      = useState(false);
  const [isPaused,       setIsPaused]       = useState(false);
  const [currentStep,    setCurrentStep]    = useState(null);
  const [stepCount,      setStepCount]      = useState(0);
  const [visitedIndices, setVisitedIndices] = useState(new Set());
  const [visitedCells,   setVisitedCells]   = useState(new Set());
  const [pathCells,      setPathCells]      = useState(new Set());
  const [foundIndex,     setFoundIndex]     = useState(null);
  const [isComplete,     setIsComplete]     = useState(false);
  const generatorRef  = useRef(null);
  const timeoutRef    = useRef(null);
  const speedRef      = useRef(500);
  const isPausedRef   = useRef(false);
  const clearState = useCallback(() => {
    setVisitedIndices(new Set());
    setVisitedCells(new Set());
    setPathCells(new Set());
    setFoundIndex(null);
    setCurrentStep(null);
    setStepCount(0);
    setIsComplete(false);
  }, []);
  const processStep = useCallback((step) => {
    setStepCount(c => c + 1);
    setCurrentStep(step);
    switch (step.type) {
      case 'visit':
      case 'compare':
      case 'range':
        if (step.index !== undefined && step.index >= 0)
          setVisitedIndices(prev => new Set(prev).add(step.index));
        if (step.row !== undefined)
          setVisitedCells(prev => new Set(prev).add(`${step.row}-${step.col}`));
        break;
      case 'enqueue':
        if (step.row !== undefined)
          setVisitedCells(prev => new Set(prev).add(`${step.row}-${step.col}`));
        break;
      case 'path':
        if (step.row !== undefined)
          setPathCells(prev => new Set(prev).add(`${step.row}-${step.col}`));
        break;
      case 'found':
        setFoundIndex(step.index !== undefined ? step.index : `${step.row}-${step.col}`);
        setIsComplete(true);
        break;
      case 'not_found':
        setIsComplete(true);
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
      if (next.value.type === 'found' || next.value.type === 'not_found') {
        setIsRunning(false);
        return;
      }
      timeoutRef.current = setTimeout(() => runLoopRef.current?.(), speedRef.current);
    } catch (e) {
      console.error('Visualization error:', e);
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
    if (next.value.type === 'found' || next.value.type === 'not_found')
      setIsRunning(false);
  }, [processStep]);
  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    generatorRef.current = null;
    isPausedRef.current  = false;
    setIsRunning(false);
    setIsPaused(false);
    clearState();
  }, [clearState]);
  const setSpeed = useCallback((ms) => { speedRef.current = ms; }, []);
  return {
    isRunning, isPaused, currentStep, stepCount,
    visitedIndices, visitedCells, pathCells, foundIndex, isComplete,
    start, pause, resume, step, reset, setSpeed,
    totalSteps: 0,
  };
}
