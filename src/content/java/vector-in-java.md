---
layout: ../../layouts/BlogLayout.astro
title: Vector in Java – Complete Guide
tag: Java Collections Framework
description: Learn about Java Vector — its synchronized nature, how it differs from ArrayList, growth strategy, legacy status, and when (and when not) to use it in modern Java code.
---

`Vector` is a legacy synchronized resizable-array implementation of `List`. Introduced in Java 1.0 — before the Collections Framework even existed — it was retrofitted to implement `List` in Java 1.2. Today it is rarely the right choice, but understanding it is important for maintaining legacy code and Java interviews.

---

## What is Vector?

`Vector` is functionally similar to `ArrayList`: it stores elements in a dynamically resizable `Object[]` and implements the full `List` interface. The key difference is that **every public method is synchronized**.

```java
import java.util.Vector;
import java.util.List;

List<String> vector = new Vector<>();
vector.add("Alice");
vector.add("Bob");
vector.add(0, "Charlie");

System.out.println(vector.get(0));  // Charlie
System.out.println(vector.size());  // 3
```

---

## How Vector Differs from ArrayList

| Feature | `Vector` | `ArrayList` |
| --- | --- | --- |
| Thread safety | Synchronized (all methods) | Not synchronized |
| Growth factor | Doubles capacity (×2) | ~1.5× |
| Custom increment | `capacityIncrement` constructor | Not supported |
| Legacy methods | `addElement`, `elementAt`, `removeElement`, `elements()` | None |
| Performance (single-threaded) | Slower (lock overhead) | Faster |
| Default capacity | 10 | 10 |
| Introduced | Java 1.0 | Java 1.2 |

---

## Growth Strategy

`ArrayList` grows to approximately 1.5× its current capacity:
```
new capacity ≈ (oldCapacity * 3) / 2 + 1
```

`Vector` doubles by default:
```
new capacity = oldCapacity * 2  (if capacityIncrement == 0)
new capacity = oldCapacity + capacityIncrement  (if capacityIncrement > 0)
```

Doubling wastes more memory but causes fewer reallocations for rapidly growing lists.

```java
// Custom increment constructor
Vector<String> v = new Vector<>(10, 5); // initial capacity 10, grow by 5 each time
```

---

## Legacy Methods

Vector has several pre-Framework methods that duplicate modern List equivalents. Avoid them in new code:

| Legacy Method | Modern Equivalent |
| --- | --- |
| `addElement(E)` | `add(E)` |
| `elementAt(int)` | `get(int)` |
| `removeElement(Object)` | `remove(Object)` |
| `removeElementAt(int)` | `remove(int)` |
| `insertElementAt(E, int)` | `add(int, E)` |
| `setElementAt(E, int)` | `set(int, E)` |
| `elements()` | `iterator()` |
| `firstElement()` | `get(0)` |
| `lastElement()` | `get(size() - 1)` |

---

## Synchronized but Not Compound-Atomic

Synchronization on Vector is per-method, not per-operation. Compound operations — check-then-act patterns — are still not atomic:

```java
Vector<String> v = new Vector<>();
v.add("Alice");

// THREAD-UNSAFE — not atomic even with Vector
if (!v.contains("Bob")) {       // thread A checks
    // thread B adds "Bob" here
    v.add("Bob");               // thread A also adds "Bob" — duplicate
}

// SAFE — explicit synchronization around the compound operation
synchronized (v) {
    if (!v.contains("Bob")) {
        v.add("Bob");
    }
}
```

This is a critical point: method-level synchronization does not make compound operations safe without additional locking.

---

## When to Use Vector

In modern Java development, the answer is essentially: **never for new code**.

- For a general-purpose list: use `ArrayList`
- For a thread-safe list: use `Collections.synchronizedList(new ArrayList<>())` or `CopyOnWriteArrayList`
- For high-concurrency scenarios: use `CopyOnWriteArrayList` (reads) or a `BlockingQueue`
- Legacy code that already uses `Vector`: leave it unless performance is a problem

The one scenario where `Vector` might appear legitimately is in code that uses `Stack` (which extends `Vector`) — but even there, `ArrayDeque` is the preferred replacement.

---

## Stack Extends Vector

`java.util.Stack` extends `Vector` and inherits all its methods. This design is widely considered a mistake — `Stack` exposes random-access `get()` and `add(int, E)` methods, which make no sense for a stack. See the [Stack article](/java/stack-in-java) for details.

---

## Example: Vector vs ArrayList in Multithreaded Code

```java
import java.util.*;
import java.util.concurrent.*;

// Using Vector (synchronized per method — may still have race conditions)
List<String> vector = new Vector<>();

// Using synchronized wrapper (same per-method guarantee, explicit intent)
List<String> syncList = Collections.synchronizedList(new ArrayList<>());

// Using CopyOnWriteArrayList (best for read-heavy workloads)
List<String> cowList = new CopyOnWriteArrayList<>();

// All three allow safe single-operation use from multiple threads
ExecutorService exec = Executors.newFixedThreadPool(4);
for (int i = 0; i < 100; i++) {
    final int n = i;
    exec.submit(() -> vector.add("item" + n));
}
exec.shutdown();
exec.awaitTermination(5, TimeUnit.SECONDS);
```

---

## Key Takeaways

- `Vector` is a legacy synchronized `List` introduced in Java 1.0
- It doubles capacity on resize, vs `ArrayList`'s ~1.5× growth
- Per-method synchronization does not make compound operations atomic
- Not recommended for new code — use `ArrayList` or concurrent alternatives
- Still appears in legacy codebases and is the parent class of `Stack`

---

## Navigation

**← Previous:** [LinkedList in Java](/java/linkedlist-in-java)

**Next →** [Stack in Java](/java/stack-in-java)
