---
layout: ../../layouts/BlogLayout.astro
title: HashMap in Java – Complete Guide
tag: Java Collections Framework
description: Deep dive into Java HashMap — hash table internals, Java 8 treeification, load factor tuning, null handling, thread safety, and interview-level implementation details.
---

`HashMap` is the most widely used `Map` implementation in Java. It provides O(1) average-time performance for `get`, `put`, and `remove` using a hash table. Understanding how it works internally is one of the most common Java interview topics.

---

## Internal Structure

A `HashMap` is an array of **buckets**, where each bucket holds a linked list (or, since Java 8, a red-black tree) of entries that hash to the same index.

```
Backing array (length 16 by default):

index 0: [Entry(key="Alice", value=95)]
index 1: null
index 2: [Entry(key="Bob", value=80)] → [Entry(key="Carol", value=70)]  ← collision
index 3: null
...
index 15: [Entry(key="Dave", value=88)]
```

Each entry stores:

```java
static class Node<K, V> {
    final int hash;
    final K key;
    V value;
    Node<K, V> next;  // linked list for chaining
}
```

---

## How `put()` Works

```
1. Compute hash: hash = key.hashCode() ^ (key.hashCode() >>> 16)
2. Determine bucket index: index = hash & (capacity - 1)
3. If bucket is empty, place the new Node there
4. If bucket has entries (collision):
   a. If any existing entry has equal key, update its value
   b. Otherwise, append to the linked list (or tree)
5. If size/capacity > loadFactor, rehash (double capacity)
```

The hash is refined with `(h >>> 16) ^ h` to spread the high bits down — this reduces collisions when the capacity is small.

---

## Java 8 Treeification

Before Java 8, hash collisions always created linked lists. In the worst case (all keys hashing to the same bucket), lookup degraded to O(n).

Java 8 converts a bucket's linked list to a **red-black tree** when:
- The bucket has **8 or more entries** (TREEIFY_THRESHOLD)
- AND the table has at least **64 slots** (MIN_TREEIFY_CAPACITY)

Once treeified, that bucket provides O(log n) worst-case lookup instead of O(n).

The tree reverts to a linked list when the bucket shrinks below **6 entries** (UNTREEIFY_THRESHOLD).

---

## Key Parameters

| Parameter | Default | Effect |
| --- | --- | --- |
| Initial capacity | 16 | Number of buckets at creation |
| Load factor | 0.75 | Rehash when size/capacity > this |
| Treeify threshold | 8 | Convert list to tree at this bucket size |
| Untreeify threshold | 6 | Revert tree to list below this |
| Min treeify capacity | 64 | Don't treeify if table < 64 slots |

**Rehashing** creates a new array (double the size) and redistributes all entries. It is O(n) and can be expensive for large maps — pre-size if you know the expected count:

```java
// For 1000 entries with load factor 0.75, you need capacity > 1000/0.75 ≈ 1333
// Next power of 2 ≥ 1334 is 2048
Map<String, Integer> map = new HashMap<>(2048);
```

Or use a convenience formula:

```java
int expectedEntries = 1000;
int capacity = (int) (expectedEntries / 0.75) + 1;
Map<String, Integer> map = new HashMap<>(capacity);
```

---

## Null Handling

`HashMap` allows:
- **One null key** — stored in bucket 0 (hash treated as 0)
- **Multiple null values** — any value can be null

```java
Map<String, String> map = new HashMap<>();
map.put(null, "null-key-value");
map.put("key1", null);
map.put("key2", null);

System.out.println(map.get(null));   // null-key-value
System.out.println(map.get("key1")); // null
System.out.println(map.containsKey(null)); // true
```

---

## Thread Safety

`HashMap` is **not thread-safe**. Concurrent modifications can cause:

- **Data corruption** — two threads resizing simultaneously can create infinite loops in the internal linked list (pre-Java 8, fixed in Java 8 but other races remain)
- **Lost updates** — concurrent puts to the same key may lose one
- **Stale reads** — visibility without happens-before is not guaranteed

For concurrent access, use:

```java
// Option 1: ConcurrentHashMap (recommended — fine-grained locking)
Map<String, Integer> concurrent = new ConcurrentHashMap<>();

// Option 2: synchronizedMap (coarse lock, legacy style)
Map<String, Integer> synced = Collections.synchronizedMap(new HashMap<>());
```

---

## Common Operations

```java
Map<String, Integer> map = new HashMap<>();

// Insert / overwrite
map.put("Alice", 95);
map.put("Bob", 80);

// Safe get
int score = map.getOrDefault("Carol", 0); // 0

// Conditional insert
map.putIfAbsent("Alice", 50); // no-op — Alice already present

// Compute
map.compute("Alice", (k, v) -> (v == null) ? 1 : v + 5); // 100

// Merge (frequency counting)
String[] words = {"a", "b", "a"};
Map<String, Integer> freq = new HashMap<>();
for (String w : words) freq.merge(w, 1, Integer::sum);
// {a=2, b=1}

// Iterate entries
map.forEach((k, v) -> System.out.println(k + " = " + v));
```

---

## Performance Tuning

**Symptom:** Many hash collisions → many entries in the same bucket → O(n) lookup.

**Causes:**
1. Poor `hashCode()` implementation (many distinct objects hash to the same value)
2. Table not large enough (high load factor)

**Fixes:**
1. Ensure `hashCode()` distributes evenly — use `Objects.hash(field1, field2, ...)` or IDE-generated implementations
2. Pre-size the map with a larger initial capacity
3. Lower the load factor if memory is not a constraint

---

## Best Practices

- Always use `getOrDefault`, `computeIfAbsent`, or `merge` instead of `containsKey` + `get` + `put` sequences — they are atomic and cleaner
- Override both `equals()` and `hashCode()` for custom key types
- Pre-size when the approximate number of entries is known
- Use `ConcurrentHashMap` for concurrent access, not `synchronizedMap`
- Program to the `Map` interface: `Map<K, V> map = new HashMap<>()`

---

## Key Takeaways

- `HashMap` uses a hash table: an array of buckets, each holding a linked list or tree
- Java 8 treeifies buckets with 8+ entries to guarantee O(log n) worst-case
- Default capacity 16, load factor 0.75 — resize doubles the table
- Allows one null key and multiple null values
- Not thread-safe — use `ConcurrentHashMap` for concurrent code

---

## Navigation

**← Previous:** [The Map Interface](/java/map-interface)

**Next →** [LinkedHashMap in Java](/java/linkedhashmap-in-java)
