import { useCallback, useRef, useState } from 'react';

/**
 * Custom hook to manage algorithm visualization state and playback
 * Consumes generator steps at a controlled speed
 */
export function useVisualization() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [stepCount, setStepCount] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [visitedIndices, setVisitedIndices] = useState(new Set());
  const [visitedCells, setVisitedCells] = useState(new Set());
  const [pathCells, setPathCells] = useState(new Set());
  const [foundIndex, setFoundIndex] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const generatorRef = useRef(null);
  const timeoutRef = useRef(null);
  const speedRef = useRef(500);
  const isPausedRef = useRef(false);
  const stepsHistoryRef = useRef([]);

  const clearState = useCallback(() => {
    setVisitedIndices(new Set());
    setVisitedCells(new Set());
    setPathCells(new Set());
    setFoundIndex(null);
    setCurrentStep(null);
    setStepCount(0);
    setTotalSteps(0);
    setIsComplete(false);
    stepsHistoryRef.current = [];
  }, []);

  const processStep = useCallback((step) => {
    stepsHistoryRef.current.push(step);
    setStepCount((c) => c + 1);
    setCurrentStep(step);

    if (step.type === 'visit' || step.type === 'compare' || step.type === 'range') {
      if (step.index !== undefined && step.index >= 0) {
        setVisitedIndices((prev) => new Set([...prev, step.index]));
      }
      if (step.row !== undefined && step.col !== undefined) {
        setVisitedCells((prev) => new Set([...prev, `${step.row}-${step.col}`]));
      }
    }

    if (step.type === 'enqueue') {
      if (step.row !== undefined && step.col !== undefined) {
        setVisitedCells((prev) => new Set([...prev, `${step.row}-${step.col}`]));
      }
    }

    if (step.type === 'path') {
      if (step.row !== undefined && step.col !== undefined) {
        setPathCells((prev) => new Set([...prev, `${step.row}-${step.col}`]));
      }
    }

    if (step.type === 'found') {
      setFoundIndex(step.index !== undefined ? step.index : `${step.row}-${step.col}`);
      setIsComplete(true);
    }

    if (step.type === 'not_found') {
      setIsComplete(true);
    }
  }, []);

  const runLoop = useCallback(() => {
    if (!generatorRef.current) return;

    try {
      const next = generatorRef.current.next();
      if (next.done) {
        setIsRunning(false);
        setIsComplete(true);
        return;
      }

      processStep(next.value);

      if (next.value.type === 'found' || next.value.type === 'not_found') {
        setIsRunning(false);
        return;
      }

      if (!isPausedRef.current) {
        timeoutRef.current = setTimeout(runLoop, speedRef.current);
      }
    } catch (e) {
      console.error(e);
      alert("Runtime Error in Generator: " + e.message);
      setIsRunning(false);
    }
  }, [processStep]);

  const start = useCallback((generator) => {
    clearState();
    generatorRef.current = generator;
    setIsRunning(true);
    setIsPaused(false);
    isPausedRef.current = false;

    // Pre-calculate total steps by cloning (we can't, so we estimate)
    timeoutRef.current = setTimeout(runLoop, 300);
  }, [clearState, runLoop]);

  const pause = useCallback(() => {
    setIsPaused(true);
    isPausedRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
    isPausedRef.current = false;
    timeoutRef.current = setTimeout(runLoop, speedRef.current);
  }, [runLoop]);

  const step = useCallback(() => {
    if (!generatorRef.current) return;

    // Pause first
    setIsPaused(true);
    isPausedRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const next = generatorRef.current.next();
    if (next.done) {
      setIsRunning(false);
      setIsComplete(true);
      return;
    }

    processStep(next.value);

    if (next.value.type === 'found' || next.value.type === 'not_found') {
      setIsRunning(false);
    }
  }, [processStep]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    generatorRef.current = null;
    setIsRunning(false);
    setIsPaused(false);
    isPausedRef.current = false;
    clearState();
  }, [clearState]);

  const setSpeed = useCallback((ms) => {
    speedRef.current = ms;
  }, []);

  return {
    isRunning,
    isPaused,
    currentStep,
    stepCount,
    totalSteps,
    visitedIndices,
    visitedCells,
    pathCells,
    foundIndex,
    isComplete,
    start,
    pause,
    resume,
    step,
    reset,
    setSpeed,
  };
}
