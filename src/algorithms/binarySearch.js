
export function* binarySearch(array, target) {
  let low = 0;
  let high = array.length - 1;
  let step = 0;

  yield {
    type: 'info',
    index: -1,
    indices: { low, high },
    range: [low, high],
    explanation: `Starting Binary Search. Array is sorted. Search range: [${low}, ${high}]`,
  };

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    step++;

    yield {
      type: 'range',
      index: mid,
      indices: { low, high, mid },
      range: [low, high],
      explanation: `Step ${step}: Search range [${low}...${high}], mid index = ${mid} (value: ${array[mid]})`,
    };

    yield {
      type: 'visit',
      index: mid,
      indices: { low, high, mid },
      range: [low, high],
      explanation: `Comparing middle element ${array[mid]} with target ${target}`,
    };

    if (array[mid] === target) {
      yield {
        type: 'found',
        index: mid,
        indices: { low, high, mid },
        range: [low, high],
        explanation: `✅ Found target ${target} at index ${mid}!`,
      };
      return;
    } else if (array[mid] < target) {
      yield {
        type: 'compare',
        index: mid,
        indices: { low, high, mid },
        range: [low, high],
        explanation: `${array[mid]} < ${target} → Target is in the RIGHT half. Eliminating left half.`,
      };
      low = mid + 1;
    } else {
      yield {
        type: 'compare',
        index: mid,
        indices: { low, high, mid },
        range: [low, high],
        explanation: `${array[mid]} > ${target} → Target is in the LEFT half. Eliminating right half.`,
      };
      high = mid - 1;
    }
  }

  yield {
    type: 'not_found',
    index: -1,
    indices: { low, high },
    range: [],
    explanation: `❌ Target ${target} not found. Search range exhausted.`,
  };
}

export const binarySearchInfo = {
  name: 'Binary Search',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(1)',
  bestCase: 'O(1)',
  worstCase: 'O(log n)',
  type: 'array',
  description: 'Divides the sorted array in half repeatedly, eliminating half of the remaining elements each step. Much faster than linear search for sorted data.',
  icon: '⚡',
};
