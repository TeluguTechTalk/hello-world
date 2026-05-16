---
layout: ../../layouts/BlogLayout.astro
title: PriorityQueue in Java – Complete Guide
tag: Java Collections Framework
description: Deep dive into Java PriorityQueue — min-heap internals, custom ordering, time complexity, top-K problems, task scheduling patterns, and common pitfalls.
---

`PriorityQueue` is a queue that orders elements by **priority** rather than insertion order. By default it acts as a **min-heap** — the smallest element is always at the head. Pass a `Comparator` to change the ordering. It is the go-to structure for Dijkstra's algorithm, top-K problems, and task scheduling.

---

## Internal Structure: Binary Heap

`PriorityQueue` is backed by a binary min-heap stored in an array:

```
Heap (min at root):        Array representation:
         1                 index: [0][1][2][3][4][5][6]
        / \                value: [ 1][ 3][ 2][ 7][ 4][ 5][ 6]
       3   2
      / \ / \
     7  4 5  6
```

- **`peek()`** — returns `array[0]` — O(1)
- **`offer()`** — appends to end, sifts up — O(log n)
- **`poll()`** — swaps root with last, removes last, sifts down — O(log n)

---

## Creating a PriorityQueue

```java
import java.util.PriorityQueue;
import java.util.Queue;

// Min-heap (default natural order)
Queue<Integer> minHeap = new PriorityQueue<>();

// Max-heap (reverse natural order)
Queue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());

// Custom comparator — by string length
Queue<String> byLength = new PriorityQueue<>(Comparator.comparingInt(String::length));

// Pre-sized (default initial capacity is 11)
Queue<Integer> sized = new PriorityQueue<>(100);

// From collection — O(n) heapify
Queue<Integer> fromList = new PriorityQueue<>(List.of(5, 2, 8, 1, 9));
```

---

## Basic Operations

```java
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.offer(5);
pq.offer(1);
pq.offer(3);
pq.offer(2);
pq.offer(4);

System.out.println(pq.peek());  // 1 — smallest, not removed
System.out.println(pq.poll());  // 1 — removed
System.out.println(pq.poll());  // 2
System.out.println(pq.poll());  // 3
// Continues in sorted order: 4, 5
```

**Important:** Iterating a `PriorityQueue` with a for-each loop does NOT give elements in priority order. Use `poll()` repeatedly for sorted retrieval.

```java
// WRONG for sorted output
for (int n : pq) System.out.println(n); // arbitrary internal order

// CORRECT
while (!pq.isEmpty()) System.out.println(pq.poll()); // sorted order
```

---

## Custom Ordering

```java
public class Task {
    String name;
    int priority; // lower number = higher priority
    Task(String name, int priority) { this.name = name; this.priority = priority; }
    @Override public String toString() { return name + "(" + priority + ")"; }
}

// Min-heap by priority field
PriorityQueue<Task> tasks = new PriorityQueue<>(
    Comparator.comparingInt(t -> t.priority)
);

tasks.offer(new Task("Low", 10));
tasks.offer(new Task("Critical", 1));
tasks.offer(new Task("Medium", 5));

while (!tasks.isEmpty()) {
    System.out.println(tasks.poll());
    // Critical(1), Medium(5), Low(10)
}
```

---

## Time Complexity

| Operation | Time |
| --- | --- |
| `offer(E)` — insert | O(log n) |
| `poll()` — remove head | O(log n) |
| `peek()` — view head | O(1) |
| `contains(Object)` | O(n) — no index |
| `remove(Object)` | O(n) scan + O(log n) heapify |
| `size()` | O(1) |
| Build from collection | O(n) — heapify |
| Iteration (unsorted) | O(n) |

---

## Classic Patterns

### Top-K Smallest Elements

```java
public static List<Integer> topKSmallest(int[] nums, int k) {
    // Use a max-heap of size k — keep only the k smallest
    PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
    for (int n : nums) {
        maxHeap.offer(n);
        if (maxHeap.size() > k) maxHeap.poll(); // remove largest
    }
    List<Integer> result = new ArrayList<>(maxHeap);
    Collections.sort(result);
    return result;
}

System.out.println(topKSmallest(new int[]{3,1,4,1,5,9,2,6,5}, 3)); // [1, 1, 2]
```

### Top-K Most Frequent Elements

```java
public static List<Integer> topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> freq = new HashMap<>();
    for (int n : nums) freq.merge(n, 1, Integer::sum);

    // Min-heap by frequency — keep k most frequent
    PriorityQueue<Map.Entry<Integer, Integer>> pq =
        new PriorityQueue<>(Comparator.comparingInt(Map.Entry::getValue));

    for (Map.Entry<Integer, Integer> e : freq.entrySet()) {
        pq.offer(e);
        if (pq.size() > k) pq.poll();
    }

    List<Integer> result = new ArrayList<>();
    while (!pq.isEmpty()) result.add(pq.poll().getKey());
    Collections.reverse(result);
    return result;
}
```

### Merge K Sorted Lists

```java
public static List<Integer> mergeKSorted(List<List<Integer>> lists) {
    // [value, listIndex, elementIndex]
    PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));

    for (int i = 0; i < lists.size(); i++) {
        if (!lists.get(i).isEmpty()) {
            pq.offer(new int[]{lists.get(i).get(0), i, 0});
        }
    }

    List<Integer> result = new ArrayList<>();
    while (!pq.isEmpty()) {
        int[] curr = pq.poll();
        result.add(curr[0]);
        int li = curr[1], ei = curr[2] + 1;
        if (ei < lists.get(li).size()) {
            pq.offer(new int[]{lists.get(li).get(ei), li, ei});
        }
    }
    return result;
}
```

### Dijkstra's Shortest Path

```java
public static int[] dijkstra(int[][] graph, int src) {
    int n = graph.length;
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[src] = 0;

    // [distance, node]
    PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
    pq.offer(new int[]{0, src});

    while (!pq.isEmpty()) {
        int[] curr = pq.poll();
        int d = curr[0], u = curr[1];
        if (d > dist[u]) continue; // stale entry
        for (int v = 0; v < n; v++) {
            if (graph[u][v] > 0 && dist[u] + graph[u][v] < dist[v]) {
                dist[v] = dist[u] + graph[u][v];
                pq.offer(new int[]{dist[v], v});
            }
        }
    }
    return dist;
}
```

---

## Null and Thread Safety

- **Null not allowed** — `offer(null)` throws `NullPointerException`
- **Not thread-safe** — use `PriorityBlockingQueue` for concurrent access:

```java
import java.util.concurrent.PriorityBlockingQueue;
PriorityBlockingQueue<Task> concurrentPQ = new PriorityBlockingQueue<>();
```

---

## Key Takeaways

- `PriorityQueue` is a binary min-heap — smallest element is always at the head
- Use `Comparator.reverseOrder()` for a max-heap
- O(log n) for offer/poll, O(1) for peek, O(n) for contains/remove
- Iterating with for-each gives internal array order, NOT sorted order — use `poll()` for sorted retrieval
- Core patterns: top-K, merge K sorted, Dijkstra, scheduling

---

## Navigation

**← Previous:** [The Queue Interface](/java/queue-interface)

**Next →** [The Deque Interface](/java/deque-interface)
