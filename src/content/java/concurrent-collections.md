---
layout: ../../layouts/BlogLayout.astro
title: Concurrent Collections in Java
tag: Java Collections Framework
description: Learn Java concurrent collections — ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue implementations, ConcurrentLinkedQueue, and ConcurrentSkipListMap with real-world patterns.
---

Concurrent collections in `java.util.concurrent` are designed for safe, high-performance access from multiple threads. They go beyond simple synchronization wrappers by using fine-grained locking, lock-free algorithms, or copy-on-write semantics — delivering far better throughput than `Collections.synchronizedXxx` wrappers.

---

## Why Not Just synchronizedXxx?

`Collections.synchronizedList()` and `synchronizedMap()` serialize all access under a single lock. Under contention, this becomes a bottleneck — threads queue up to hold the one lock.

Concurrent collections solve this with:

- **Fine-grained locking** — lock only the bucket or segment being accessed
- **Lock-free (CAS)** — compare-and-swap CPU instructions avoid locks entirely
- **Copy-on-write** — write creates a new snapshot, reads proceed lock-free on the old one

---

## ConcurrentHashMap

`ConcurrentHashMap` is the concurrent replacement for `HashMap` and `Hashtable`. In Java 8+, it uses **CAS + per-bucket synchronization** — reads are completely lock-free and writes only lock the specific bucket being modified.

```java
import java.util.concurrent.ConcurrentHashMap;

ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
map.put("Alice", 95);
map.put("Bob", 80);

// Atomic compound operations
map.putIfAbsent("Carol", 70);              // atomic
map.computeIfAbsent("Dave", k -> 60);      // atomic
map.merge("Alice", 5, Integer::sum);       // atomic increment

// Safe iteration — no ConcurrentModificationException
for (Map.Entry<String, Integer> e : map.entrySet()) {
    System.out.println(e.getKey() + " = " + e.getValue());
}
```

**Key properties:**
- Does **not** allow null keys or null values (unlike `HashMap`)
- `size()` returns an approximation during concurrent updates — use `mappingCount()` for a more accurate count
- Iteration reflects the state at the start of iteration — you may or may not see concurrent inserts

### Frequency Counting (Concurrent)

```java
ConcurrentHashMap<String, Long> freq = new ConcurrentHashMap<>();
String[] words = {"java", "is", "great", "java", "is"};

for (String w : words) {
    freq.merge(w, 1L, Long::sum); // atomic merge
}
System.out.println(freq); // {java=2, is=2, great=1}
```

---

## CopyOnWriteArrayList

`CopyOnWriteArrayList` is a thread-safe `List` where every mutating operation (`add`, `remove`, `set`) creates a **new copy of the internal array**. Reads (iteration, get) operate on the old snapshot — completely lock-free.

```java
import java.util.concurrent.CopyOnWriteArrayList;

CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();
list.add("Alice");
list.add("Bob");

// Reads are lock-free and iterate a snapshot
for (String s : list) {
    list.add("Carol"); // does NOT throw ConcurrentModificationException
    // but "Carol" won't appear in this iteration (snapshot)
}
System.out.println(list); // [Alice, Bob, Carol]
```

**Best for:** Read-heavy workloads with rare writes — event listener lists, configuration snapshots.

**Avoid when:** Writes are frequent — each write allocates and copies the entire array.

---

## CopyOnWriteArraySet

Built on `CopyOnWriteArrayList`. Same semantics: write = new copy, reads = lock-free.

```java
import java.util.concurrent.CopyOnWriteArraySet;

CopyOnWriteArraySet<String> set = new CopyOnWriteArraySet<>();
set.add("listener1");
set.add("listener2");
set.add("listener1"); // ignored — no duplicates

// Iteration is fail-safe
for (String listener : set) {
    notify(listener);
}
```

---

## BlockingQueue

`BlockingQueue` extends `Queue` with **blocking operations**: `put()` blocks if the queue is full; `take()` blocks if the queue is empty. This is the foundation for the producer-consumer pattern.

### LinkedBlockingQueue

Backed by a linked list. Optionally bounded (defaults to `Integer.MAX_VALUE`):

```java
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.BlockingQueue;

BlockingQueue<String> queue = new LinkedBlockingQueue<>(100); // bounded at 100

// Producer
new Thread(() -> {
    try {
        queue.put("task1"); // blocks if full
        queue.put("task2");
    } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
}).start();

// Consumer
new Thread(() -> {
    try {
        while (true) {
            String task = queue.take(); // blocks if empty
            process(task);
        }
    } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
}).start();
```

### ArrayBlockingQueue

Backed by a fixed-size array. Capacity must be specified at construction. Optionally fair (FIFO waiting threads):

```java
import java.util.concurrent.ArrayBlockingQueue;

BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(50);       // bounded, non-fair
BlockingQueue<Integer> fairQueue = new ArrayBlockingQueue<>(50, true); // fair
```

### PriorityBlockingQueue

Unbounded priority queue — elements dequeued in priority order. Blocks on `take()` if empty:

```java
import java.util.concurrent.PriorityBlockingQueue;

PriorityBlockingQueue<Integer> pq = new PriorityBlockingQueue<>();
pq.offer(5); pq.offer(1); pq.offer(3);
System.out.println(pq.poll()); // 1 — min element
```

### SynchronousQueue

A rendezvous channel — no internal storage. Each `put()` waits for a `take()`, and vice versa:

```java
import java.util.concurrent.SynchronousQueue;

SynchronousQueue<String> sq = new SynchronousQueue<>();
// Put in one thread, take in another — they pair up directly
```

Used internally by `Executors.newCachedThreadPool()`.

---

## ConcurrentLinkedQueue

A non-blocking, unbounded FIFO queue using CAS operations. Best for producers that cannot afford to block:

```java
import java.util.concurrent.ConcurrentLinkedQueue;

ConcurrentLinkedQueue<String> queue = new ConcurrentLinkedQueue<>();
queue.offer("task"); // never blocks
String t = queue.poll(); // returns null if empty, never blocks
```

---

## ConcurrentSkipListMap and ConcurrentSkipListSet

Thread-safe sorted map/set based on a skip list (a probabilistic alternative to balanced trees):

```java
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.concurrent.ConcurrentSkipListSet;

ConcurrentSkipListMap<String, Integer> map = new ConcurrentSkipListMap<>();
map.put("Alice", 95); map.put("Bob", 80); map.put("Carol", 70);
System.out.println(map); // {Alice=95, Bob=80, Carol=70} — sorted

ConcurrentSkipListSet<String> set = new ConcurrentSkipListSet<>(Set.of("C","A","B"));
System.out.println(set); // [A, B, C] — sorted, thread-safe
```

O(log n) for most operations — the concurrent equivalent of `TreeMap` and `TreeSet`.

---

## Comparison Table

| Class | Interface | Concurrency | Best For |
| --- | --- | --- | --- |
| `ConcurrentHashMap` | `Map` | Lock-free reads, bucket-level writes | High-throughput key-value |
| `CopyOnWriteArrayList` | `List` | Write = new copy, reads lock-free | Read-heavy, rare writes |
| `CopyOnWriteArraySet` | `Set` | Same as above | Listener/subscriber lists |
| `LinkedBlockingQueue` | `BlockingQueue` | Two locks (head/tail) | Producer-consumer |
| `ArrayBlockingQueue` | `BlockingQueue` | One lock | Bounded producer-consumer |
| `PriorityBlockingQueue` | `BlockingQueue` | One lock | Priority-ordered work |
| `SynchronousQueue` | `BlockingQueue` | No internal storage | Handoff between threads |
| `ConcurrentLinkedQueue` | `Queue` | CAS (lock-free) | Non-blocking FIFO |
| `ConcurrentSkipListMap` | `NavigableMap` | Fine-grained | Concurrent sorted map |
| `ConcurrentSkipListSet` | `NavigableSet` | Fine-grained | Concurrent sorted set |

---

## Key Takeaways

- Concurrent collections replace `synchronized` wrappers for high-throughput concurrent code
- `ConcurrentHashMap` — lock-free reads, fine-grained writes, no nulls allowed
- `CopyOnWriteArrayList` — ideal for read-dominated lists (event listeners, config snapshots)
- `BlockingQueue` — producer-consumer foundation with built-in blocking semantics
- `ConcurrentLinkedQueue` — non-blocking unbounded queue for producers that can't block
- `ConcurrentSkipListMap/Set` — concurrent replacement for `TreeMap`/`TreeSet`

---

## Navigation

**← Previous:** [The Collections Utility Class](/java/collections-utility-class)

**Next →** [Fail-Fast vs Fail-Safe Iterators](/java/failfast-vs-failsafe)
