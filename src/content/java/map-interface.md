---
layout: ../../layouts/BlogLayout.astro
title: The Map Interface in Java
tag: Java Collections Framework
description: Understand the Java Map interface — key-value semantics, Map.Entry, iteration patterns, key methods, and how to choose between HashMap, LinkedHashMap, and TreeMap.
---

`Map` is a collection that maps **keys to values**. Each key is unique; each key maps to exactly one value. `Map` is not a subtype of `Collection` — it has its own hierarchy. It is the most important data structure for lookup-heavy code.

---

## What Map Guarantees

1. **Unique keys** — a key can appear at most once
2. **Each key maps to exactly one value** — `put(key, value)` overwrites any existing mapping
3. **Null behaviour** — depends on implementation (HashMap allows one null key; TreeMap does not)
4. **No index-based access** — you access values by key, not by position

---

## Core Methods

### Inserting and Updating

```java
Map<String, Integer> scores = new HashMap<>();
scores.put("Alice", 95);         // insert or overwrite
scores.putIfAbsent("Alice", 50); // only inserts if key absent — Alice stays 95
scores.put("Bob", 80);

// Replace only if key exists
scores.replace("Bob", 85);          // 85
scores.replace("Carol", 70, 75);    // no-op — Carol not present

// Compute with a function
scores.compute("Alice", (k, v) -> v == null ? 1 : v + 5); // 100
scores.merge("Bob", 10, Integer::sum); // 85 + 10 = 95
```

### Retrieving Values

```java
int a = scores.get("Alice");          // 100 — NullPointerException if key absent
Integer b = scores.get("Carol");      // null — key absent
int c = scores.getOrDefault("Carol", 0); // 0 — safer
```

### Removing

```java
scores.remove("Bob");               // removes if present
scores.remove("Alice", 99);         // removes ONLY if key maps to 99 (conditional)
```

### Checking State

```java
scores.containsKey("Alice");    // true
scores.containsValue(100);      // true (linear scan)
scores.size();                  // 1
scores.isEmpty();               // false
```

---

## The Three Collection Views

`Map` exposes three live views you can iterate and stream:

```java
Map<String, Integer> map = Map.of("Alice", 95, "Bob", 80, "Carol", 70);

// Keys only
Set<String> keys = map.keySet();
for (String key : keys) System.out.println(key);

// Values only (may contain duplicates)
Collection<Integer> values = map.values();
int sum = values.stream().mapToInt(Integer::intValue).sum();

// Key-value pairs — the most useful view
Set<Map.Entry<String, Integer>> entries = map.entrySet();
for (Map.Entry<String, Integer> entry : entries) {
    System.out.println(entry.getKey() + " → " + entry.getValue());
}

// Java 8 forEach
map.forEach((k, v) -> System.out.println(k + " → " + v));
```

---

## Map.Entry

`Map.Entry<K, V>` represents a single key-value pair. You get entries via `entrySet()`. In Java 9+, you can create standalone entries with `Map.entry(k, v)`.

```java
Map.Entry<String, Integer> e = Map.entry("Alice", 95);
System.out.println(e.getKey());   // Alice
System.out.println(e.getValue()); // 95
e.setValue(100); // modifies the backing map if obtained via entrySet
```

---

## Advanced Operations (Java 8+)

### computeIfAbsent — Build-On-Demand

```java
Map<String, List<String>> groups = new HashMap<>();

// Without computeIfAbsent:
String key = "java";
if (!groups.containsKey(key)) groups.put(key, new ArrayList<>());
groups.get(key).add("streams");

// With computeIfAbsent (cleaner):
groups.computeIfAbsent("java", k -> new ArrayList<>()).add("streams");
groups.computeIfAbsent("java", k -> new ArrayList<>()).add("generics");
// groups = {java=[streams, generics]}
```

### merge — Frequency Counting

```java
String[] words = {"java", "is", "great", "java", "is", "fun"};
Map<String, Integer> freq = new HashMap<>();
for (String w : words) {
    freq.merge(w, 1, Integer::sum);
}
System.out.println(freq); // {java=2, is=2, great=1, fun=1}
```

### replaceAll

```java
Map<String, Integer> scores = new HashMap<>(Map.of("Alice", 90, "Bob", 80));
scores.replaceAll((k, v) -> v + 5); // add 5 to every score
```

---

## Choosing a Map Implementation

| | `HashMap` | `LinkedHashMap` | `TreeMap` | `Hashtable` |
| --- | --- | --- | --- | --- |
| Order | None | Insertion (or access) | Sorted by key | None |
| `get`/`put`/`remove` | O(1) avg | O(1) avg | O(log n) | O(1) avg |
| Null keys | 1 allowed | 1 allowed | Not allowed | Not allowed |
| Null values | Yes | Yes | Yes | Not allowed |
| Thread safe | No | No | No | Yes (legacy) |
| Use for | General lookup | Ordered iteration, LRU cache | Sorted keys, range queries | Legacy code only |

**Default choice:** `HashMap` — fastest for pure key-based lookup.

---

## Common Mistakes

**Iterating and modifying the map simultaneously:**

```java
Map<String, Integer> map = new HashMap<>(Map.of("A", 1, "B", 2, "C", 3));

// Throws ConcurrentModificationException
for (String key : map.keySet()) {
    if (map.get(key) < 2) map.remove(key);
}

// CORRECT — use entrySet iterator or collect keys first
map.entrySet().removeIf(e -> e.getValue() < 2);
```

**Using mutable objects as keys:**

```java
Map<List<Integer>, String> map = new HashMap<>();
List<Integer> key = new ArrayList<>(List.of(1, 2));
map.put(key, "value");
key.add(3); // changes key's hashCode
map.get(key); // null — key is lost in wrong bucket
```

---

## Key Takeaways

- `Map` provides key-to-value mapping with unique keys
- Three views: `keySet()`, `values()`, `entrySet()` — iterate via `entrySet()` for most use cases
- Use `getOrDefault`, `computeIfAbsent`, and `merge` for cleaner code over null checks
- `HashMap` for speed, `LinkedHashMap` for order, `TreeMap` for sorted keys
- Never mutate keys after inserting them into a map

---

## Navigation

**← Previous:** [The Deque Interface](/java/deque-interface)

**Next →** [HashMap in Java](/java/hashmap-in-java)
