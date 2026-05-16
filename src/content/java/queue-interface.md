---
layout: ../../layouts/BlogLayout.astro
title: The Queue Interface in Java
tag: Java Collections Framework
description: Understand the Java Queue interface — FIFO semantics, the two sets of methods (exception-throwing vs null-returning), common implementations, and how to choose between them.
---

`Queue` is a collection designed for **FIFO (First-In, First-Out)** element processing. Elements are added at the tail and removed from the head. The `Queue` interface extends `Collection` and defines two parallel sets of methods — one that throws exceptions and one that returns special values.

---

## FIFO — First In, First Out

```
Enqueue: add to tail
Dequeue: remove from head

Queue state:  HEAD → [A][B][C][D] ← TAIL

offer("E")  → [A][B][C][D][E]
poll()      → returns "A" → [B][C][D][E]
peek()      → returns "B" → [B][C][D][E]
```

---

## The Two Sets of Methods

Queue defines six core methods in two flavors. Choose based on how you want failure handled:

| Operation | Throws Exception | Returns Special Value |
| --- | --- | --- |
| Insert | `add(e)` — throws `IllegalStateException` if full | `offer(e)` — returns `false` if full |
| Remove head | `remove()` — throws `NoSuchElementException` if empty | `poll()` — returns `null` if empty |
| Examine head | `element()` — throws `NoSuchElementException` if empty | `peek()` — returns `null` if empty |

**Rule of thumb:** In most application code, prefer `offer`, `poll`, and `peek`. The null-returning versions compose better with conditional logic and avoid try-catch noise.

```java
Queue<String> queue = new LinkedList<>();
queue.offer("First");
queue.offer("Second");
queue.offer("Third");

// Check and remove without exception handling
String head = queue.peek();   // "First" — still in queue
String removed = queue.poll(); // "First" — removed
System.out.println(queue);     // [Second, Third]

// Process all items
while (!queue.isEmpty()) {
    String task = queue.poll();
    process(task);
}
```

---

## Common Implementations

| Implementation | Backed By | Ordered By | Null | Thread-Safe |
| --- | --- | --- | --- | --- |
| `LinkedList` | Doubly linked list | Insertion (FIFO) | Yes | No |
| `ArrayDeque` | Resizable array | Insertion (FIFO) | No | No |
| `PriorityQueue` | Binary heap | Priority (min by default) | No | No |
| `LinkedBlockingQueue` | Linked list | Insertion (FIFO) | No | Yes |
| `ArrayBlockingQueue` | Fixed array | Insertion (FIFO) | No | Yes |
| `PriorityBlockingQueue` | Binary heap | Priority | No | Yes |
| `ConcurrentLinkedQueue` | Linked list | Insertion (FIFO) | No | Yes (non-blocking) |

---

## LinkedList vs ArrayDeque as a Queue

For non-concurrent FIFO queue use, prefer `ArrayDeque` over `LinkedList`:

```java
// Acceptable
Queue<Task> queue = new LinkedList<>();

// Better — faster, less memory, no null-element footgun
Queue<Task> queue = new ArrayDeque<>();
```

`ArrayDeque` uses a compact circular array and avoids the per-element `Node` allocation overhead of `LinkedList`. It is consistently faster in benchmarks.

---

## Full Example: BFS with Queue

Breadth-first search (BFS) is the canonical queue use case:

```java
import java.util.*;

public class BFS {
    public static List<Integer> bfs(Map<Integer, List<Integer>> graph, int start) {
        List<Integer> visited = new ArrayList<>();
        Set<Integer> seen = new HashSet<>();
        Queue<Integer> queue = new ArrayDeque<>();

        queue.offer(start);
        seen.add(start);

        while (!queue.isEmpty()) {
            int node = queue.poll();
            visited.add(node);

            for (int neighbour : graph.getOrDefault(node, List.of())) {
                if (seen.add(neighbour)) {
                    queue.offer(neighbour);
                }
            }
        }
        return visited;
    }
}
```

---

## Full Example: Task Processing Queue

```java
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class WorkerPool {
    private final BlockingQueue<Runnable> taskQueue = new LinkedBlockingQueue<>(100);

    public void submit(Runnable task) throws InterruptedException {
        taskQueue.put(task); // blocks if queue is full
    }

    public void startWorker() {
        new Thread(() -> {
            while (true) {
                try {
                    Runnable task = taskQueue.take(); // blocks if empty
                    task.run();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }).start();
    }
}
```

---

## Queue vs Deque vs List

| | `Queue` | `Deque` | `List` |
| --- | --- | --- | --- |
| Access | Head only | Both ends | Any index |
| Semantics | FIFO | LIFO or FIFO | Random access |
| Order | Insertion / priority | Insertion / priority | Insertion |
| Use for | Task queues, BFS | Stacks, sliding windows | Sequences |

---

## Key Takeaways

- `Queue` provides FIFO semantics: elements enter at the tail and leave from the head
- Two method families: exception-throwing (`add`, `remove`, `element`) and null-returning (`offer`, `poll`, `peek`)
- Prefer `offer`, `poll`, `peek` for most code
- `ArrayDeque` is the best non-concurrent queue implementation for most use cases
- Use `LinkedBlockingQueue` or `ArrayBlockingQueue` for producer-consumer patterns

---

## Navigation

**← Previous:** [TreeSet in Java](/java/treeset-in-java)

**Next →** [PriorityQueue in Java](/java/priorityqueue-in-java)
