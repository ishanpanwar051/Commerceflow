export interface ScoredItem<T> {
  item: T;
  score: number;
}

function bubbleUp<T>(heap: ScoredItem<T>[], idx: number): void {
  while (idx > 0) {
    const parent = Math.floor((idx - 1) / 2);
    if (heap[idx].score >= heap[parent].score) break;
    [heap[idx], heap[parent]] = [heap[parent], heap[idx]];
    idx = parent;
  }
}

function bubbleDown<T>(heap: ScoredItem<T>[], idx: number): void {
  const n = heap.length;
  while (true) {
    let smallest = idx;
    const left = 2 * idx + 1;
    const right = 2 * idx + 2;
    if (left < n && heap[left].score < heap[smallest].score) smallest = left;
    if (right < n && heap[right].score < heap[smallest].score) smallest = right;
    if (smallest === idx) break;
    [heap[idx], heap[smallest]] = [heap[smallest], heap[idx]];
    idx = smallest;
  }
}

export function findTopK<T>(items: ScoredItem<T>[], k: number): ScoredItem<T>[] {
  const heap: ScoredItem<T>[] = [];

  for (const entry of items) {
    if (heap.length < k) {
      heap.push(entry);
      bubbleUp(heap, heap.length - 1);
    } else if (entry.score > heap[0].score) {
      heap[0] = entry;
      bubbleDown(heap, 0);
    }
  }

  return heap.sort((a, b) => b.score - a.score);
}
