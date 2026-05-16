---
layout: ../../layouts/BlogLayout.astro
title: Hashtable in Java – Complete Guide
tag: Java Collections Framework
description: Learn about Java Hashtable — its synchronized design, differences from HashMap, null restrictions, legacy status, and why ConcurrentHashMap is the modern replacement.
---

`Hashtable` is a legacy synchronized `Map` implementation introduced in Java 1.0. It was retrofitted to implement the `Map` interface in Java 1.2. While still present in the JDK, it is essentially obsolete — replaced by `HashMap` for single-threaded code and `ConcurrentHashMap` for concurrent code.

---

## What is Hashtable?

`Hashtable` works like `HashMap` — a hash table with buckets — but every public method is synchronized. This means only one thread can execute any `Hashtable` operation at a time, making it thread-safe at the cost of significant performance overhead in multi-threaded applications.

```java
import java.util.Hashtable;
import java.util.Map;

Map<String, Integer> ht = new Hashtable<>();
ht.put("Alice", 95);
ht.put("Bob", 80);

System.out.println(ht.get("Alice")); // 95
System.out.println(ht.size());       // 2
```

---

## Hashtable vs HashMap

| Feature | `Hashtable` | `HashMap` |
| --- | --- | --- |
| Thread safety | All methods synchronized | Not synchronized |
| Null key | Not allowed | 1 allowed |
| Null value | Not allowed | Multiple allowed |
| Iteration | `Enumeration` (legacy) + `Iterator` | `Iterator` |
| Default capacity | 11 | 16 |
| Growth factor | `oldCapacity * 2 + 1` | `oldCapacity * 2` |
| Introduced | Java 1.0 | Java 1.2 |
| Performance | Slower (lock on every op) | Faster |
| Recommended | No — use HashMap or ConcurrentHashMap | Yes |

---

## Null Restriction

`Hashtable` rejects both null keys and null values. Attempting to insert either throws `NullPointerException`:

```java
Hashtable<String, String> ht = new Hashtable<>();
ht.put(null, "value"); // NullPointerException
ht.put("key", null);   // NullPointerException
```

This differs from `HashMap`, which allows one null key and any number of null values.

---

## Legacy Enumeration API

Before iterators existed, `Hashtable` used `Enumeration` for traversal. This API is now obsolete but still present:

```java
Hashtable<String, Integer> ht = new Hashtable<>();
ht.put("A", 1);
ht.put("B", 2);

// Legacy (do not use in new code)
java.util.Enumeration<String> keys = ht.keys();
while (keys.hasMoreElements()) {
    String key = keys.nextElement();
    System.out.println(key + " = " + ht.get(key));
}

// Modern equivalent
for (Map.Entry<String, Integer> e : ht.entrySet()) {
    System.out.println(e.getKey() + " = " + e.getValue());
}
```

---

## Method-Level Synchronization Is Not Enough

Like `Vector`, `Hashtable` synchronizes individual methods but not compound operations. Check-then-act sequences are still not atomic:

```java
Hashtable<String, Integer> ht = new Hashtable<>();
ht.put("count", 0);

// NOT ATOMIC — two threads can interleave these reads and writes
if (ht.get("count") < 10) {
    ht.put("count", ht.get("count") + 1);
}

// ATOMIC — ConcurrentHashMap supports this natively
import java.util.concurrent.ConcurrentHashMap;
ConcurrentHashMap<String, Integer> chm = new ConcurrentHashMap<>();
chm.put("count", 0);
chm.merge("count", 1, Integer::sum); // atomic increment
```

---

## Why ConcurrentHashMap Wins

`ConcurrentHashMap` (introduced in Java 5) replaced `Hashtable` for concurrent use cases:

| | `Hashtable` | `ConcurrentHashMap` |
| --- | --- | --- |
| Locking | One lock for the entire map | Segment locks (Java 7) / CAS + bin locks (Java 8) |
| Concurrent reads | Blocked by any write | Non-blocking |
| Concurrent writes | One at a time | Multiple threads write to different segments |
| Null key/value | Not allowed | Not allowed |
| Atomic operations | None beyond individual methods | `putIfAbsent`, `compute`, `merge`, `replace` |
| Performance under concurrency | Poor | Excellent |

For single-threaded code: `HashMap`.
For concurrent code: `ConcurrentHashMap`.
For `Hashtable`: legacy maintenance only.

---

## When You Still See Hashtable

You encounter `Hashtable` in:

1. **Legacy codebases** — pre-Java 5 code written when `ConcurrentHashMap` did not exist
2. **`java.util.Properties`** — which extends `Hashtable` (so every `.properties` file loader uses `Hashtable` internally)
3. **Older frameworks and libraries** — some serialization or RMI APIs use it

```java
// Properties extends Hashtable — this is the main place Hashtable still matters
java.util.Properties props = new java.util.Properties();
props.load(new FileInputStream("config.properties"));
String dbUrl = props.getProperty("db.url");
```

---

## Migration Guide

Replacing `Hashtable` with modern equivalents:

```java
// Old
Map<String, Integer> map = new Hashtable<>();

// Single-threaded replacement
Map<String, Integer> map = new HashMap<>();

// Multi-threaded replacement
Map<String, Integer> map = new ConcurrentHashMap<>();

// If you need null values
Map<String, Integer> map = Collections.synchronizedMap(new HashMap<>());
```

---

## Key Takeaways

- `Hashtable` is a legacy synchronized `Map` — do not use it in new code
- It forbids null keys and null values (unlike `HashMap`)
- Per-method synchronization makes it thread-safe but not useful for compound operations
- `ConcurrentHashMap` is the correct replacement for concurrent maps
- `Hashtable` still surfaces through `java.util.Properties`

---

## Navigation

**← Previous:** [TreeMap in Java](/java/treemap-in-java)

**Next →** [Comparable vs Comparator](/java/comparable-vs-comparator)
