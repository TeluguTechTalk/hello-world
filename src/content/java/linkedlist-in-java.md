---
layout: ../../layouts/BlogLayout.astro
title: LinkedList in Java – Complete Guide
tag: Java Collections Framework
description: Understand Java LinkedList — doubly linked node structure, List and Deque implementation, time complexity, comparison with ArrayList, and when to use it.
---

`LinkedList` is a doubly linked list implementation that implements both `List` and `Deque`. Unlike `ArrayList`, it stores each element in a separate node object linked by pointers — which gives O(1) insertions and deletions at the head/tail but O(n) random access.

---

## Internal Structure

Each element in a `LinkedList` is wrapped in a private `Node` object:

```java
private static class Node<E> {
    E item;
    Node<E> next;
    Node<E> prev;
}
```

The list maintains references to the first and last nodes:

```
null ← [prev|Alice|next] ↔ [prev|Bob|next] ↔ [prev|Carol|next] → null
        ↑ first                                          ↑ last
```

Adding or removing at either end is O(1) — just update the `first` or `last` pointer and adjust one neighbour. Inserting or removing in the middle requires walking the list to find the position — O(n).

---

## Creating a LinkedList

```java
import java.util.LinkedList;
import java.util.List;
import java.util.Deque;

// As a List
List<String> list = new LinkedList<>();

// As a Deque
Deque<String> deque = new LinkedList<>();

// Construct from collection
LinkedList<String> linked = new LinkedList<>(List.of("Alice", "Bob", "Carol"));
```

---

## List Operations

Since `LinkedList` implements `List`, all standard list methods work:

```java
LinkedList<String> list = new LinkedList<>();
list.add("Alice");        // append — O(1)
list.add(0, "Bob");       // insert at index — O(n) to find position, O(1) to link
list.get(1);              // O(n) — must traverse from head
list.set(0, "Carol");     // O(n) to find, O(1) to update
list.remove(0);           // O(n) to find, O(1) to unlink
list.remove("Alice");     // O(n) scan, O(1) unlink
list.size();              // O(1) — maintained as a field
```

---

## Deque Operations

`LinkedList` also implements `Deque`, which is its primary advantage over `ArrayList`:

```java
LinkedList<String> deque = new LinkedList<>();

// Add to both ends — O(1)
deque.addFirst("First");
deque.addLast("Last");
deque.offerFirst("NewFirst");
deque.offerLast("NewLast");

// Peek at ends without removing — O(1)
String head = deque.peekFirst();
String tail = deque.peekLast();

// Remove from both ends — O(1)
String removed = deque.pollFirst();
String removed2 = deque.pollLast();

// Use as a stack
deque.push("A");   // addFirst
deque.pop();       // removeFirst

// Use as a queue
deque.offer("B");  // addLast
deque.poll();      // removeFirst
```

---

## Time Complexity

| Operation | LinkedList | ArrayList |
| --- | --- | --- |
| `add(E)` — append | O(1) | O(1) amortized |
| `add(0, E)` — prepend | O(1) | O(n) |
| `add(int, E)` — middle insert | O(n) | O(n) |
| `get(int)` | O(n) | O(1) |
| `set(int, E)` | O(n) | O(1) |
| `remove(int)` | O(n) | O(n) |
| `remove(Object)` | O(n) | O(n) |
| `addFirst(E)` | O(1) | N/A |
| `addLast(E)` | O(1) | O(1) amortized |
| `removeFirst()` | O(1) | O(n) |
| `removeLast()` | O(1) | O(1) |
| Memory per element | Higher (3 references + object header) | Lower (one array slot) |

---

## LinkedList vs ArrayList — When to Choose

**Choose `ArrayList` when:**
- You primarily read elements by index
- You append to the end frequently
- Memory efficiency matters
- Cache performance matters (ArrayList elements are contiguous in memory)

**Choose `LinkedList` when:**
- You frequently insert or remove from the **head** — O(1) vs O(n)
- You need a **Deque** (double-ended queue) — `ArrayDeque` is usually better still
- You are building a **queue** that grows and shrinks rapidly from both ends

**Reality check:** In practice, `ArrayList` outperforms `LinkedList` even for frequent insertions in most benchmarks because modern CPUs heavily optimize sequential memory access. Always measure before switching.

---

## LinkedList as a Queue

```java
import java.util.Queue;
import java.util.LinkedList;

Queue<String> queue = new LinkedList<>();
queue.offer("First");
queue.offer("Second");
queue.offer("Third");

while (!queue.isEmpty()) {
    System.out.println(queue.poll()); // First, Second, Third
}
```

Note: For pure queue usage, prefer `ArrayDeque` — it is faster and uses less memory.

---

## Memory Overhead

Every element in a `LinkedList` occupies a `Node` object with three fields: `item`, `next`, `prev`. On a 64-bit JVM with compressed oops, each node costs roughly 32 bytes (16 bytes object header + 3 references × ~4 bytes each + padding).

An `ArrayList` stores just one reference per slot in the backing array — roughly 4 bytes per element.

For a list of 1 million strings, `LinkedList` uses approximately 8× more memory for the structure itself.

---

## Common Mistakes

**Using `get(i)` in a loop:**

```java
// VERY SLOW — O(n²) because each get() traverses from the head
LinkedList<String> list = new LinkedList<>(largeCollection);
for (int i = 0; i < list.size(); i++) {
    process(list.get(i)); // O(n) per call
}

// CORRECT — use iterator or enhanced for loop — O(n) total
for (String item : list) {
    process(item);
}
```

**Choosing LinkedList for queue when ArrayDeque is available:**

```java
// Acceptable but suboptimal
Queue<Task> queue = new LinkedList<>();

// Better — faster, less memory
Queue<Task> queue = new ArrayDeque<>();
```

---

## Key Takeaways

- `LinkedList` is a doubly linked list implementing both `List` and `Deque`
- O(1) at head and tail; O(n) for indexed access and middle operations
- Significantly higher memory overhead than `ArrayList` per element
- Prefer `ArrayList` for random access workloads and `ArrayDeque` for pure queue/stack use
- Never use index-based `get()` in a loop on a `LinkedList` — it is O(n²)

---

## Navigation

**← Previous:** [ArrayList in Java](/java/arraylist-in-java)

**Next →** [Vector in Java](/java/vector-in-java)
