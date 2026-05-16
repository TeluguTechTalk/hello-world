---
layout: ../../layouts/BlogLayout.astro
title: ArrayList in Java – Complete Guide
tag: Java Collections Framework
description: Deep dive into Java ArrayList — how it works internally, time complexity, common operations, resizing strategy, best practices, and common pitfalls to avoid.
---

`ArrayList` is the most commonly used collection in Java. It is a resizable array implementation of the `List` interface that gives you the flexibility of dynamic sizing with nearly the same performance as a raw array for most operations.

---

## How ArrayList Works Internally

An `ArrayList` is backed by a plain Java array (`Object[]`). When the array fills up, a new, larger array is allocated and all elements are copied.

```
Initial:   [A][B][C][_][_][_][_][_][_][_]  ← capacity 10, size 3
After add: [A][B][C][D][_][_][_][_][_][_]  ← size 4, still fits
Full:      [A][B][C][D][E][F][G][H][I][J]  ← capacity 10, size 10
Resize:    [A][B][C][D][E][F][G][H][I][J][_]...[_]  ← new capacity 15
```

**Growth factor:** Java grows the internal array to `(oldCapacity * 3) / 2 + 1` — roughly 1.5× each time.

**Default initial capacity:** 10 (with a no-arg constructor). The array is only actually allocated on the first `add()` in Java 8+.

---

## Creating an ArrayList

```java
import java.util.ArrayList;
import java.util.List;

// Default constructor (capacity 10)
List<String> list = new ArrayList<>();

// Pre-allocate capacity to avoid resizing
List<String> list2 = new ArrayList<>(1000);

// Construct from another collection
List<String> list3 = new ArrayList<>(List.of("Alice", "Bob", "Charlie"));

// Factory method — returns unmodifiable list (not ArrayList)
List<String> immutable = List.of("A", "B", "C");
```

---

## Common Operations

### Add

```java
List<String> names = new ArrayList<>();
names.add("Alice");        // append — O(1) amortized
names.add(0, "Bob");       // insert at index — O(n)
names.addAll(List.of("Carol", "Dave")); // append all — O(k)
```

### Access and Search

```java
String name = names.get(2);          // O(1) — direct array access
int idx = names.indexOf("Alice");    // O(n) — linear scan
boolean has = names.contains("Bob"); // O(n) — linear scan
```

### Update

```java
names.set(1, "Eve");  // O(1) — direct array write
```

### Remove

```java
names.remove(0);         // remove by index — O(n) because elements shift left
names.remove("Alice");   // remove by value — O(n) scan + O(n) shift
names.removeIf(n -> n.startsWith("E")); // safe bulk removal — O(n)
```

### Trim and Clear

```java
names.clear();             // removes all elements, capacity unchanged — O(n)
((ArrayList<String>) names).trimToSize(); // shrinks backing array to current size
```

---

## Time Complexity

| Operation | Average | Worst |
| --- | --- | --- |
| `add(E)` — append | O(1) amortized | O(n) on resize |
| `add(int, E)` — insert at index | O(n) | O(n) |
| `get(int)` | O(1) | O(1) |
| `set(int, E)` | O(1) | O(1) |
| `remove(int)` | O(n) | O(n) |
| `remove(Object)` | O(n) | O(n) |
| `contains(Object)` | O(n) | O(n) |
| `size()` | O(1) | O(1) |
| `indexOf(Object)` | O(n) | O(n) |

---

## Pre-Allocating Capacity

If you know roughly how many elements you will add, pre-allocate to avoid repeated resizing:

```java
// Without pre-allocation: ~log(n) resize operations for n elements
List<String> slow = new ArrayList<>();

// With pre-allocation: zero resizes
List<String> fast = new ArrayList<>(10_000);

for (int i = 0; i < 10_000; i++) {
    fast.add("item" + i);
}
```

This matters for lists with millions of entries. For typical application code with hundreds or low thousands of entries, the default capacity is fine.

---

## Iterating Safely

```java
List<String> names = new ArrayList<>(List.of("Alice", "Bob", "Carol"));

// WRONG — ConcurrentModificationException
for (String name : names) {
    if (name.equals("Bob")) {
        names.remove(name);
    }
}

// CORRECT — removeIf (Java 8, cleanest)
names.removeIf(name -> name.equals("Bob"));

// CORRECT — Iterator.remove()
Iterator<String> it = names.iterator();
while (it.hasNext()) {
    if (it.next().equals("Bob")) {
        it.remove();
    }
}

// CORRECT — collect to new list (immutable input)
List<String> filtered = names.stream()
    .filter(n -> !n.equals("Bob"))
    .collect(Collectors.toList());
```

---

## Thread Safety

`ArrayList` is **not thread-safe**. Concurrent reads are fine, but concurrent writes — or a write concurrent with a read — produce unpredictable results.

Options for thread-safe list usage:

```java
// Option 1: Collections.synchronizedList (coarse lock per operation)
List<String> synced = Collections.synchronizedList(new ArrayList<>());
// Must synchronize manually for compound operations:
synchronized (synced) {
    if (!synced.contains("Alice")) synced.add("Alice");
}

// Option 2: CopyOnWriteArrayList (best for read-heavy, write-rare)
import java.util.concurrent.CopyOnWriteArrayList;
List<String> cowList = new CopyOnWriteArrayList<>();
cowList.add("Alice"); // creates a new internal array on every write
```

---

## Best Practices

- **Program to the `List` interface**, not `ArrayList`:
  ```java
  List<String> names = new ArrayList<>();  // not ArrayList<String> names
  ```
- **Pre-allocate when size is known** to avoid resize overhead
- **Use `removeIf()` or `Iterator.remove()`** for safe in-loop removal
- **Avoid `ArrayList` for frequent head/middle insertions** — each insert is O(n)
- **Use `List.of()` for fixed data** — it is faster and immutable

---

## Common Mistakes

**Forgetting that `subList()` is a view:**

```java
List<String> list = new ArrayList<>(List.of("A", "B", "C", "D"));
List<String> sub = list.subList(1, 3);  // [B, C]
sub.clear();  // ALSO clears B and C from the original list
System.out.println(list);  // [A, D]
```

If you need an independent copy: `new ArrayList<>(list.subList(1, 3))`.

**Using `==` instead of `equals()` for object comparison:**

```java
List<String> list = new ArrayList<>();
list.add(new String("Alice"));
System.out.println(list.contains("Alice")); // true — contains uses equals()
```

---

## Key Takeaways

- `ArrayList` is backed by a resizable `Object[]` that grows ~1.5× on overflow
- O(1) get/set, O(1) amortized append, O(n) insert/remove by position
- Pre-allocate capacity when size is predictable to avoid resize cost
- Not thread-safe — use `CopyOnWriteArrayList` or `synchronizedList` in concurrent code
- Default choice for any general-purpose list — only switch if profiling shows a bottleneck

---

## Navigation

**← Previous:** [The List Interface](/java/list-interface)

**Next →** [LinkedList in Java](/java/linkedlist-in-java)
