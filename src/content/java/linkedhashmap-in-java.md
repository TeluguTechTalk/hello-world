---
layout: ../../layouts/BlogLayout.astro
title: LinkedHashMap in Java – Complete Guide
tag: Java Collections Framework
description: Learn Java LinkedHashMap — insertion and access order modes, LRU cache implementation, performance characteristics, and when to use it over HashMap or TreeMap.
---

`LinkedHashMap` extends `HashMap` and maintains a **doubly linked list** through all its entries. This gives it predictable iteration order — either **insertion order** (default) or **access order** (opt-in). It is the foundation for building LRU (Least Recently Used) caches.

---

## How It Works Internally

Every entry in a `LinkedHashMap` is a `LinkedHashMap.Entry<K, V>` that extends `HashMap.Node<K, V>` and adds two extra pointers: `before` and `after`:

```java
static class Entry<K, V> extends HashMap.Node<K, V> {
    Entry<K, V> before, after;
}
```

These pointers form a doubly linked list through all entries, ordered by insertion (or access). The hash table provides O(1) key lookup; the linked list provides consistent iteration order.

---

## Creating a LinkedHashMap

```java
import java.util.LinkedHashMap;
import java.util.Map;

// Default — insertion order
Map<String, Integer> map = new LinkedHashMap<>();

// Insertion order, pre-sized
Map<String, Integer> map2 = new LinkedHashMap<>(16, 0.75f);

// Access order — true = LRU mode
Map<String, Integer> lruMap = new LinkedHashMap<>(16, 0.75f, true);
```

---

## Insertion Order (Default)

```java
Map<String, Integer> map = new LinkedHashMap<>();
map.put("Banana", 3);
map.put("Apple", 5);
map.put("Cherry", 1);
map.put("Apple", 7); // update value — position in list does NOT change

for (Map.Entry<String, Integer> e : map.entrySet()) {
    System.out.println(e.getKey() + " = " + e.getValue());
}
// Banana = 3
// Apple = 7
// Cherry = 1
// (insertion order preserved; Apple stays in its original position)
```

Compare with `HashMap`, which would print in an arbitrary order, and `TreeMap`, which would print alphabetically.

---

## Access Order

When constructed with `accessOrder = true`, each `get()` or `getOrDefault()` moves the accessed entry to the **tail** of the linked list. This means iteration goes from least-recently-used to most-recently-used:

```java
Map<String, Integer> map = new LinkedHashMap<>(16, 0.75f, true);
map.put("A", 1);
map.put("B", 2);
map.put("C", 3);

map.get("A"); // A accessed — moves to tail
System.out.println(map.keySet()); // [B, C, A]

map.get("B"); // B accessed — moves to tail
System.out.println(map.keySet()); // [C, A, B]
```

---

## LRU Cache — Classic Pattern

Override `removeEldestEntry()` to automatically evict the oldest entry when the cache exceeds its capacity:

```java
public class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int maxSize;

    public LRUCache(int maxSize) {
        super(maxSize, 0.75f, true); // access order
        this.maxSize = maxSize;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > maxSize; // evict when over capacity
    }
}

LRUCache<Integer, String> cache = new LRUCache<>(3);
cache.put(1, "one");
cache.put(2, "two");
cache.put(3, "three");
cache.get(1);           // access 1 — moves to tail
cache.put(4, "four");   // evicts LRU (2, which is now the head)

System.out.println(cache.keySet()); // [3, 1, 4]
```

This is a fully functional O(1) LRU cache — the same structure as `java.util.LinkedHashMap` is taught in LeetCode's LRU Cache problem.

---

## Time Complexity

| Operation | Time |
| --- | --- |
| `put(K, V)` | O(1) average |
| `get(K)` | O(1) average |
| `remove(K)` | O(1) average |
| Iteration | O(n) |
| Memory | Higher than `HashMap` (2 extra pointers per entry) |

---

## LinkedHashMap vs HashMap vs TreeMap

| | `HashMap` | `LinkedHashMap` | `TreeMap` |
| --- | --- | --- | --- |
| Order | None | Insertion or access | Sorted by key |
| Performance | O(1) avg | O(1) avg | O(log n) |
| Memory | Lower | Medium | Higher |
| Use for | Speed | Ordered iteration, LRU cache | Sorted keys |

---

## Ordered Map for Stable Output

When generating reports, JSON, or logs where field order matters, use `LinkedHashMap`:

```java
Map<String, Object> response = new LinkedHashMap<>();
response.put("status", "success");
response.put("code", 200);
response.put("data", List.of("item1", "item2"));

// Serialize — order is predictable
System.out.println(response);
// {status=success, code=200, data=[item1, item2]}
```

A plain `HashMap` might serialize in any order.

---

## Thread Safety

`LinkedHashMap` is not thread-safe. For concurrent LRU caches in production, consider:

- `Collections.synchronizedMap(new LinkedHashMap<>(..., true))` — coarse lock
- Caffeine or Guava Cache — production-grade caching libraries

---

## Key Takeaways

- `LinkedHashMap` = `HashMap` + doubly linked list for predictable iteration order
- Insertion order mode (default): keys iterate in put order
- Access order mode: keys iterate LRU → MRU, enables O(1) LRU cache via `removeEldestEntry`
- Same O(1) average performance as `HashMap`, with a small memory overhead
- Not thread-safe — synchronize externally or use a dedicated cache library

---

## Navigation

**← Previous:** [HashMap in Java](/java/hashmap-in-java)

**Next →** [TreeMap in Java](/java/treemap-in-java)
