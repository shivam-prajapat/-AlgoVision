export { linearSearch, linearSearchInfo } from './linearSearch';
export { binarySearch, binarySearchInfo } from './binarySearch';
export { dfs, dfsInfo } from './dfs';
export { bfs, bfsInfo } from './bfs';

import { linearSearchInfo } from './linearSearch';
import { binarySearchInfo } from './binarySearch';
import { dfsInfo } from './dfs';
import { bfsInfo } from './bfs';

export const algorithmList = [
  { id: 'linear', ...linearSearchInfo },
  { id: 'binary', ...binarySearchInfo },
  { id: 'dfs', ...dfsInfo },
  { id: 'bfs', ...bfsInfo },
];
