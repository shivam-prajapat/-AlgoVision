
export function* linearSearch(array, target) {
  for (let i = 0; i < array.length; i++) {
    yield {
      type: 'visit',
      index: i,
      indices: { current: i },
      explanation: `Checking element at index ${i} (value: ${array[i]})`,
    };

    if (array[i] === target) {
      yield {
        type: 'found',
        index: i,
        indices: { current: i },
        explanation: `✅ Found target ${target} at index ${i}!`,
      };
      return;
    }

    yield {
      type: 'compare',
      index: i,
      indices: { current: i },
      explanation: `${array[i]} ≠ ${target}, moving to next element`,
    };
  }

  yield {
    type: 'not_found',
    index: -1,
    indices: {},
    explanation: `❌ Target ${target} not found in the array`,
  };
}

export const linearSearchInfo = {
  name: 'Linear Search',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  bestCase: 'O(1)',
  worstCase: 'O(n)',
  type: 'array',
  description: 'Sequentially checks each element of the list until the target is found or the list is exhausted. Simple but works on unsorted data.',
  icon: '🔍',
};
