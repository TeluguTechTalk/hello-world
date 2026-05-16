---
layout: ../../layouts/BlogLayout.astro
title: TreeMap in Java – Complete Guide
tag: Java Collections Framework
description: Learn Java TreeMap — red-black tree implementation, sorted key iteration, NavigableMap methods, range views, null handling, and real-world use cases.
---

`TreeMap` is a `Map` implementation that stores entries in **key-sorted order** using a red-black tree. It implements `NavigableMap`, which adds powerful boundary and range-query methods. Every operation costs O(log n), but you get sorted key iteration and floor/ceiling queries for free.

---

## How It Works Internally

`TreeMap` uses a **self-balancing red-black tree** where each node holds a key-value pair. The tree property ensures that for every node, all keys in the left subtree are smaller and all keys in the right subtree are larger. After each insertion or removal, the tree rebalances (rotations + recolouring) to keep the height at O(log n).

```
TreeMap<Integer, String> after inserting 5, 3, 8, 1, 4:

         5
        / \
       3   8
      / \
     1   4
```

All in-order traversal gives: 1, 3, 4, 5, 8 — the sorted sequence.

---

## Creating a TreeMap

```java
import java.util.TreeMap;
import java.util.NavigableMap;

// Natural order of keys (keys must implement Comparable)
NavigableMap<String, Integer> map = new TreeMap<>();

// Custom Comparator — reverse alphabetical
NavigableMap<String, Integer> reversed = new TreeMap<>(Comparator.reverseOrder());

// Case-insensitive keys
NavigableMap<String, Integer> ci = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);

// From an existing map
Map<String, Integer> source = Map.of("Alice", 95, "Bob", 80, "Carol", 70);
NavigableMap<String, Integer> sorted = new TreeMap<>(source);
System.out.println(sorted); // {Alice=95, Bob=80, Carol=70} — alphabetical
```

---

## Basic Operations

```java
NavigableMap<String, Integer> map = new TreeMap<>();
map.put("Charlie", 75);
map.put("Alice", 95);
map.put("Bob", 80);

// Iteration is always in key-sorted order
map.forEach((k, v) -> System.out.println(k + " = " + v));
// Alice = 95
// Bob = 80
// Charlie = 75

map.get("Alice");         // 95
map.remove("Bob");
map.containsKey("Alice"); // true
```

---

## NavigableMap Methods

### Boundary Methods

```java
NavigableMap<Integer, String> map = new TreeMap<>();
map.put(10, "ten"); map.put(20, "twenty"); map.put(30, "thirty");
map.put(40, "forty"); map.put(50, "fifty");

map.firstKey();       // 10
map.lastKey();        // 50

map.floorKey(25);     // 20 — greatest key ≤ 25
map.ceilingKey(25);   // 30 — smallest key ≥ 25
map.lowerKey(30);     // 20 — greatest key strictly < 30
map.higherKey(30);    // 40 — smallest key strictly > 30

map.firstEntry();     // Entry(10, "ten")
map.pollFirstEntry(); // removes and returns Entry(10, "ten")
map.pollLastEntry();  // removes and returns Entry(50, "fifty")
```

### Range Views

```java
NavigableMap<Integer, String> map = new TreeMap<>(
    Map.of(10,"a", 20,"b", 30,"c", 40,"d", 50,"e")
);

// headMap — entries with key < 30 (exclusive)
map.headMap(30);              // {10=a, 20=b}
map.headMap(30, true);        // {10=a, 20=b, 30=c} — inclusive

// tailMap — entries with key >= 30 (inclusive)
map.tailMap(30);              // {30=c, 40=d, 50=e}
map.tailMap(30, false);       // {40=d, 50=e} — exclusive

// subMap — entries in range
map.subMap(20, 40);                   // {20=b, 30=c} — [20, 40)
map.subMap(20, true, 40, true);       // {20=b, 30=c, 40=d} — [20, 40]

// Descending
map.descendingMap();            // {50=e, 40=d, 30=c, 20=b, 10=a}
map.descendingKeySet();         // [50, 40, 30, 20, 10]
```

Range views are **live** — changes to the view affect the backing `TreeMap` and vice versa.

---

## Null Key Handling

`TreeMap` does **not allow null keys**. Inserting null throws `NullPointerException` because the tree must compare null to other keys during insertion. Null values are allowed.

```java
TreeMap<String, String> map = new TreeMap<>();
map.put(null, "value"); // NullPointerException
map.put("key", null);   // OK — null values are fine
```

---

## Time Complexity

| Operation | Time |
| --- | --- |
| `put(K, V)` | O(log n) |
| `get(K)` | O(log n) |
| `remove(K)` | O(log n) |
| `containsKey(K)` | O(log n) |
| `firstKey()` / `lastKey()` | O(log n) |
| `floorKey()` / `ceilingKey()` | O(log n) |
| Iteration | O(n) |

---

## Real-World Use Cases

### 1. Event Scheduler (Time-Based)

```java
NavigableMap<Long, List<Runnable>> schedule = new TreeMap<>();

void scheduleAt(long epochMs, Runnable task) {
    schedule.computeIfAbsent(epochMs, k -> new ArrayList<>()).add(task);
}

void runDueTasks(long now) {
    // headMap gives all entries with key <= now (inclusive)
    NavigableMap<Long, List<Runnable>> due = schedule.headMap(now, true);
    due.forEach((t, tasks) -> tasks.forEach(Runnable::run));
    due.clear();
}
```

### 2. Stock Price Lookup (Nearest Price)

```java
NavigableMap<Double, String> priceBook = new TreeMap<>();
priceBook.put(99.5, "Limit Buy");
priceBook.put(100.0, "Market");
priceBook.put(101.0, "Limit Sell");

double ask = 100.3;
Map.Entry<Double, String> bestBid = priceBook.floorEntry(ask);   // 100.0
Map.Entry<Double, String> bestOffer = priceBook.ceilingEntry(ask); // 101.0
```

### 3. Word Frequency in Sorted Order

```java
String text = "to be or not to be that is the question";
Map<String, Long> freq = new TreeMap<>(); // automatically sorted
for (String word : text.split(" ")) {
    freq.merge(word, 1L, Long::sum);
}
freq.forEach((w, c) -> System.out.println(w + ": " + c));
// be: 2
// is: 1
// not: 1
// or: 1
// ...
```

---

## Key Takeaways

- `TreeMap` maintains entries sorted by key (natural order or custom `Comparator`)
- Backed by a red-black tree — O(log n) guaranteed for all major operations
- `NavigableMap` methods: `floorKey`, `ceilingKey`, `lowerKey`, `higherKey`, `headMap`, `tailMap`, `subMap`
- Null keys not allowed; null values are fine
- Range views are live — modifications propagate to the backing map
- Use when sorted key iteration or range queries are needed; use `HashMap` for pure lookup speed

---

## Navigation

**← Previous:** [LinkedHashMap in Java](/java/linkedhashmap-in-java)

**Next →** [Hashtable in Java](/java/hashtable-in-java)
