import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Grid from './components/Grid';
import ControlPanel from './components/ControlPanel';
import InfoPanel from './components/InfoPanel';
import LoadingScreen from './components/LoadingScreen';
import { useVisualization } from './hooks/useVisualization';
import { linearSearch } from './algorithms/linearSearch';
import { binarySearch } from './algorithms/binarySearch';
import { dfs } from './algorithms/dfs';
import { bfs } from './algorithms/bfs';
import {
  generateRandomArray,
  generateSortedArray,
  generateRandomGrid,
  getDefaultPositions,
} from './utils/gridUtils';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('linear');
  const [arrayData, setArrayData] = useState(() => generateRandomArray(20));
  const [gridData, setGridData] = useState(() => generateRandomGrid(15, 30));
  const [startPos, setStartPos] = useState([7, 1]);
  const [endPos, setEndPos] = useState([7, 28]);
  const [target, setTarget] = useState('');
  const [dataSize, setDataSize] = useState(20);
  const [speed, setSpeedState] = useState(500);
  const [placingMode, setPlacingMode] = useState(null); // 'start' | 'end' | 'wall'

  const viz = useVisualization();

  // Apply dark/light class to document
  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode);
  }, [darkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (viz.isRunning && !viz.isPaused) {
            viz.pause();
          } else if (viz.isRunning && viz.isPaused) {
            viz.resume();
          } else if (!viz.isComplete) {
            handleStart();
          }
          break;
        case 'KeyS':
          handleStep();
          break;
        case 'KeyR':
          handleReset();
          break;
        case 'KeyG':
          if (!viz.isRunning) handleGenerateData();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viz.isRunning, viz.isPaused, viz.isComplete, selectedAlgorithm, arrayData, gridData, target]);

  const isGraphAlgo = selectedAlgorithm === 'dfs' || selectedAlgorithm === 'bfs';

  // Generate new data
  const handleGenerateData = useCallback(() => {
    viz.reset();
    if (selectedAlgorithm === 'binary') {
      const arr = generateSortedArray(dataSize);
      setArrayData(arr);
    } else if (selectedAlgorithm === 'linear') {
      const arr = generateRandomArray(dataSize);
      setArrayData(arr);
    } else {
      const grid = generateRandomGrid(15, 30);
      setGridData(grid);
      const pos = getDefaultPositions(15, 30);
      setStartPos(pos.start);
      setEndPos(pos.end);
    }
    setTarget('');
  }, [selectedAlgorithm, dataSize, viz]);

  // Handle algorithm selection
  const handleSelectAlgorithm = useCallback((algoId) => {
    if (viz.isRunning) return;
    viz.reset();
    setSelectedAlgorithm(algoId);

    // Generate appropriate data
    if (algoId === 'binary') {
      setArrayData(generateSortedArray(dataSize));
    } else if (algoId === 'linear') {
      setArrayData(generateRandomArray(dataSize));
    } else {
      const grid = generateRandomGrid(15, 30);
      setGridData(grid);
      const pos = getDefaultPositions(15, 30);
      setStartPos(pos.start);
      setEndPos(pos.end);
    }
    setTarget('');
  }, [viz.isRunning, dataSize, viz]);

  // Start visualization
  const handleStart = useCallback(() => {
    let generator;

    if (selectedAlgorithm === 'linear') {
      const t = parseInt(target) || arrayData[Math.floor(Math.random() * arrayData.length)];
      setTarget(String(t));
      generator = linearSearch(arrayData, t);
    } else if (selectedAlgorithm === 'binary') {
      const t = parseInt(target) || arrayData[Math.floor(Math.random() * arrayData.length)];
      setTarget(String(t));
      generator = binarySearch(arrayData, t);
    } else if (selectedAlgorithm === 'dfs') {
      generator = dfs(gridData, startPos, endPos);
    } else if (selectedAlgorithm === 'bfs') {
      generator = bfs(gridData, startPos, endPos);
    }

    if (generator) {
      viz.start(generator);
    }
  }, [selectedAlgorithm, arrayData, gridData, target, startPos, endPos, viz]);

  // Step through
  const handleStep = useCallback(() => {
    if (!viz.isRunning && !viz.isComplete) {
      // Start silently and immediately pause, then step
      let generator;
      if (selectedAlgorithm === 'linear') {
        const t = parseInt(target) || arrayData[Math.floor(Math.random() * arrayData.length)];
        setTarget(String(t));
        generator = linearSearch(arrayData, t);
      } else if (selectedAlgorithm === 'binary') {
        const t = parseInt(target) || arrayData[Math.floor(Math.random() * arrayData.length)];
        setTarget(String(t));
        generator = binarySearch(arrayData, t);
      } else if (selectedAlgorithm === 'dfs') {
        generator = dfs(gridData, startPos, endPos);
      } else if (selectedAlgorithm === 'bfs') {
        generator = bfs(gridData, startPos, endPos);
      }
      if (generator) {
        viz.start(generator);
        // Pause immediately and do one step
        setTimeout(() => {
          viz.pause();
          viz.step();
        }, 50);
      }
    } else {
      viz.step();
    }
  }, [selectedAlgorithm, arrayData, gridData, target, startPos, endPos, viz]);

  // Reset
  const handleReset = useCallback(() => {
    viz.reset();
  }, [viz]);

  // Speed change
  const handleSpeedChange = useCallback((ms) => {
    setSpeedState(ms);
    viz.setSpeed(ms);
  }, [viz]);

  // Grid cell click (for placing walls, start, end)
  const handleCellClick = useCallback((row, col) => {
    if (viz.isRunning) return;

    setGridData((prev) => {
      const newGrid = prev.map((r) => [...r]);

      // If clicking on start position
      if (row === startPos[0] && col === startPos[1]) return prev;
      // If clicking on end position
      if (row === endPos[0] && col === endPos[1]) return prev;

      // Toggle wall
      newGrid[row][col] = newGrid[row][col] === 1 ? 0 : 1;
      return newGrid;
    });
  }, [viz.isRunning, startPos, endPos]);

  // Size change
  const handleSizeChange = useCallback((size) => {
    setDataSize(size);
    viz.reset();
    if (selectedAlgorithm === 'binary') {
      setArrayData(generateSortedArray(size));
    } else if (selectedAlgorithm === 'linear') {
      setArrayData(generateRandomArray(size));
    }
    setTarget('');
  }, [selectedAlgorithm, viz]);

  return (
    <>
      {/* Loading Screen */}
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {/* Main App */}
      <div className={`min-h-screen gradient-bg grid-pattern ${darkMode ? '' : 'light'}`}>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* Main Layout */}
        <div className="pt-20 pb-4 px-3 md:px-4 lg:px-6 max-w-[1920px] mx-auto h-screen flex flex-col">
          <div className="flex-1 flex gap-3 md:gap-4 min-h-0">
            {/* Sidebar */}
            <div className="hidden md:block w-56 lg:w-64 flex-shrink-0">
              <Sidebar
                selectedAlgorithm={selectedAlgorithm}
                onSelectAlgorithm={handleSelectAlgorithm}
                isRunning={viz.isRunning}
              />
            </div>

            {/* Center Content */}
            <div className="flex-1 flex flex-col gap-3 md:gap-4 min-w-0">
              {/* Mobile Algorithm Selector */}
              <div className="md:hidden">
                <select
                  value={selectedAlgorithm}
                  onChange={(e) => handleSelectAlgorithm(e.target.value)}
                  disabled={viz.isRunning}
                  className="w-full h-10 px-3 rounded-xl text-sm font-medium border-0 outline-none cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#e2e8f0',
                  }}
                >
                  <option value="linear">🔍 Linear Search</option>
                  <option value="binary">⚡ Binary Search</option>
                  <option value="dfs">🌊 Depth First Search</option>
                  <option value="bfs">🌐 Breadth First Search</option>
                </select>
              </div>

              {/* Visualization Area */}
              <motion.div
                className="flex-1 glass rounded-2xl overflow-auto flex items-center justify-center min-h-0"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2.3, duration: 0.5 }}
              >
                {isGraphAlgo && gridData ? (
                  <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
                    <Grid
                      algorithm={selectedAlgorithm}
                      gridData={gridData}
                      visitedIndices={viz.visitedIndices}
                      visitedCells={viz.visitedCells}
                      pathCells={viz.pathCells}
                      foundIndex={viz.foundIndex}
                      currentStep={viz.currentStep}
                      isComplete={viz.isComplete}
                      startPos={startPos}
                      endPos={endPos}
                      onCellClick={handleCellClick}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center overflow-auto">
                    <Grid
                      algorithm={selectedAlgorithm}
                      arrayData={arrayData}
                      visitedIndices={viz.visitedIndices}
                      visitedCells={viz.visitedCells}
                      pathCells={viz.pathCells}
                      foundIndex={viz.foundIndex}
                      currentStep={viz.currentStep}
                      isComplete={viz.isComplete}
                    />
                  </div>
                )}
              </motion.div>

              {/* Graph Instructions */}
              {isGraphAlgo && !viz.isRunning && !viz.isComplete && (
                <motion.div
                  className="text-center text-xs py-1"
                  style={{ color: '#475569' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  💡 Click cells to toggle walls • ▶ = Start • ◆ = End
                </motion.div>
              )}

              {/* Control Panel */}
              <ControlPanel
                onStart={handleStart}
                onPause={viz.pause}
                onResume={viz.resume}
                onReset={handleReset}
                onStep={handleStep}
                onSpeedChange={handleSpeedChange}
                onGenerateData={handleGenerateData}
                onTargetChange={setTarget}
                onSizeChange={handleSizeChange}
                isRunning={viz.isRunning}
                isPaused={viz.isPaused}
                isComplete={viz.isComplete}
                speed={speed}
                target={target}
                dataSize={dataSize}
                algorithm={selectedAlgorithm}
              />
            </div>

            {/* Info Panel */}
            <div className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
              <InfoPanel
                algorithm={selectedAlgorithm}
                currentStep={viz.currentStep}
                stepCount={viz.stepCount}
                isRunning={viz.isRunning}
                isPaused={viz.isPaused}
                isComplete={viz.isComplete}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
