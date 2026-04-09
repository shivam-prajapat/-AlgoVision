
export function* bfs(grid, start, end) {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
  const queue = [start];
  visited[start[0]][start[1]] = true;
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
    explanation: `Starting BFS from node (${start[0]}, ${start[1]}). Using a queue to explore level by level.`,
  };

  while (queue.length > 0) {
    const [row, col] = queue.shift();

    yield {
      type: 'visit',
      row,
      col,
      explanation: `Visiting node (${row}, ${col}). Queue size: ${queue.length}`,
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
          explanation: `✅ Shortest path found! Tracing step ${i + 1}/${path.length}`,
        };
      }

      yield {
        type: 'found',
        row,
        col,
        path,
        explanation: `✅ Reached target (${end[0]}, ${end[1]})! Shortest path length: ${path.length} nodes`,
      };
      return;
    }

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (
        newRow >= 0 && newRow < rows &&
        newCol >= 0 && newCol < cols &&
        !visited[newRow][newCol] &&
        grid[newRow][newCol] !== 1
      ) {
        visited[newRow][newCol] = true;
        parent[newRow][newCol] = [row, col];
        queue.push([newRow, newCol]);

        yield {
          type: 'enqueue',
          row: newRow,
          col: newCol,
          explanation: `Adding neighbor (${newRow}, ${newCol}) to queue`,
        };
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

export const bfsInfo = {
  name: 'Breadth First Search',
  timeComplexity: 'O(V + E)',
  spaceComplexity: 'O(V)',
  bestCase: 'O(1)',
  worstCase: 'O(V + E)',
  type: 'graph',
  description: 'Explores all neighbors at the current depth before moving to nodes at the next depth level. Uses a queue (FIFO). Guarantees the shortest path in unweighted graphs.',
  icon: '🌐',
};
