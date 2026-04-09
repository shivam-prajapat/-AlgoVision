
export function* dfs(grid, start, end) {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
  const stack = [start];
  const directions = [
    [-1, 0],
    [0, 1],  
    [1, 0], 
    [0, -1], 
  ];

  yield {
    type: 'start',
    row: start[0],
    col: start[1],
    explanation: `Starting DFS from node (${start[0]}, ${start[1]}). Using a stack to explore.`,
  };

  while (stack.length > 0) {
    const [row, col] = stack.pop();

    if (row < 0 || row >= rows || col < 0 || col >= cols) continue;
    if (visited[row][col] || grid[row][col] === 1) continue;

    visited[row][col] = true;

    yield {
      type: 'visit',
      row,
      col,
      explanation: `Visiting node (${row}, ${col}). Stack size: ${stack.length}`,
    };

    if (row === end[0] && col === end[1]) {
      const path = [];
      let current = [row, col];
      while (current) {
        path.unshift(current);
        current = parent[current[0]][current[1]];
      }

      for (let i = 0; i < path.length; i++) {
        yield {
          type: 'path',
          row: path[i][0],
          col: path[i][1],
          explanation: `✅ Path found! Tracing path step ${i + 1}/${path.length}`,
        };
      }

      yield {
        type: 'found',
        row,
        col,
        path,
        explanation: `✅ Reached target (${end[0]}, ${end[1]})! Path length: ${path.length} nodes`,
      };
      return;
    }

    for (let i = directions.length - 1; i >= 0; i--) {
      const [dr, dc] = directions[i];
      const newRow = row + dr;
      const newCol = col + dc;

      if (
        newRow >= 0 && newRow < rows &&
        newCol >= 0 && newCol < cols &&
        !visited[newRow][newCol] &&
        grid[newRow][newCol] !== 1
      ) {
        stack.push([newRow, newCol]);
        if (!parent[newRow][newCol]) {
          parent[newRow][newCol] = [row, col];
        }
      }
    }
  }

  yield {
    type: 'not_found',
    row: -1,
    col: -1,
    explanation: '❌ No path found to the target node!',
  };
}

export const dfsInfo = {
  name: 'Depth First Search',
  timeComplexity: 'O(V + E)',
  spaceComplexity: 'O(V)',
  bestCase: 'O(1)',
  worstCase: 'O(V + E)',
  type: 'graph',
  description: 'Explores as deep as possible along each branch before backtracking. Uses a stack (LIFO). Good for finding any path but not guaranteed shortest.',
  icon: '🌊',
};
