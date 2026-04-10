
export function generateRandomArray(size = 20, min = 1, max = 99) {
  const arr = [];
  const used = new Set();
  while (arr.length < size) {
    const val = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!used.has(val)) {
      used.add(val);
      arr.push(val);
    }
    if (used.size >= max - min + 1) break;
  }
  return arr;
}

export function generateSortedArray(size = 20, min = 1, max = 99) {
  return generateRandomArray(size, min, max).sort((a, b) => a - b);
}


export function generateGrid(rows = 15, cols = 30) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

export function generateRandomGrid(rows = 15, cols = 30, wallDensity = 0.25) {
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (Math.random() < wallDensity ? 1 : 0))
  );

  const startRow = Math.floor(rows / 2);
  const endRow = Math.floor(rows / 2);
  grid[startRow][1] = 0;
  grid[endRow][cols - 2] = 0;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const sr = startRow + dr;
      const sc = 1 + dc;
      const er = endRow + dr;
      const ec = cols - 2 + dc;
      if (sr >= 0 && sr < rows && sc >= 0 && sc < cols) grid[sr][sc] = 0;
      if (er >= 0 && er < rows && ec >= 0 && ec < cols) grid[er][ec] = 0;
    }
  }

  return grid;
}

export function getDefaultPositions(rows, cols) {
  return {
    start: [Math.floor(rows / 2), 1],
    end: [Math.floor(rows / 2), cols - 2],
  };
}
