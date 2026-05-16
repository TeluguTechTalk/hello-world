---
layout: ../../layouts/BlogLayout.astro
title: LinkedHashSet in Java – Complete Guide
tag: Java Collections Framework
description: Learn Java LinkedHashSet — insertion-order iteration, LinkedHashMap backing, performance, null handling, and when to use it over HashSet or TreeSet.
---

`LinkedHashSet` is a `HashSet` that maintains **insertion order**. It combines a hash table (for O(1) lookups) with a doubly linked list (to remember the order elements were added). It is the right choice when you need both fast uniqueness checking and predictable iteration order.

---

## How It Works Internally

`LinkedHashSet` extends `HashSet` and is backed by a `LinkedHashMap`. Each element is stored as a key in the `LinkedHashMap`, and the map maintains a doubly linked list through all its entries to preserve insertion order.

```
Insertion order: "C", "A", "B"

Hash table (buckets):
  bucket 0: [C]
  bucket 1: [A]
  bucket 2: [B]

Linked list (maintains order):
  head → [C] ↔ [A] ↔ [B] → null
```

When you iterate, the linked list is followed — so elements always come out in insertion order.

---

## Creating a LinkedHashSet

```java
import java.util.LinkedHashSet;
import java.util.Set;

// Default — capacity 16, load factor 0.75
Set<String> set = new LinkedHashSet<>();

// Pre-sized
Set<String> set2 = new LinkedHashSet<>(100);

// From a collection — deduplicates AND preserves insertion order
List<String> withDups = List.of("C", "A", "B", "A", "C");
Set<String> ordered = new LinkedHashSet<>(withDups); // [C, A, B]
```

---

## Common Operations

```java
Set<String> set = new LinkedHashSet<>();
set.add("Banana");
set.add("Apple");
set.add("Cherry");
set.add("Apple");  // ignored — already present

System.out.println(set);  // [Banana, Apple, Cherry] — insertion order preserved

set.contains("Apple");  // true — O(1)
set.remove("Banana");   // [Apple, Cherry]
set.size();             // 2
```

---

## Iteration Order

Unlike `HashSet` (which gives an unpredictable order) and `TreeSet` (which gives sorted order), `LinkedHashSet` always iterates in the order elements were first inserted:

```java
Set<String> hash   = new HashSet<>(List.of("C", "A", "B"));
Set<String> linked = new LinkedHashSet<>(List.of("C", "A", "B"));
Set<String> tree   = new TreeSet<>(List.of("C", "A", "B"));

System.out.println(hash);   // unpredictable: [A, B, C] or [B, C, A] etc.
System.out.println(linked); // [C, A, B] — insertion order
System.out.println(tree);   // [A, B, C] — sorted
```

---

## Use Case: Ordered Deduplication

The most common reason to use `LinkedHashSet` over `HashSet` is to deduplicate a list while preserving the original order:

```java
public static <T> List<T> deduplicate(List<T> input) {
    return new ArrayList<>(new LinkedHashSet<>(input));
}

List<String> tags = List.of("java", "spring", "java", "boot", "spring");
List<String> unique = deduplicate(tags);
System.out.println(unique); // [java, spring, boot]
```

---

## Use Case: Recently Visited Pages (FIFO Deduplication)

```java
Set<String> recentPages = new LinkedHashSet<>();

void visit(String url) {
    recentPages.remove(url);   // move to end if re-visited
    recentPages.add(url);
}

visit("/home");
visit("/java");
visit("/home");  // re-visited — moves to end
visit("/spring");

System.out.println(recentPages); // [/java, /home, /spring]
```

---

## Performance

| Operation | Time |
| --- | --- |
| `add(E)` | O(1) average |
| `contains(Object)` | O(1) average |
| `remove(Object)` | O(1) average |
| Iteration | O(n) — follows linked list |
| Memory | Higher than `HashSet` (linked list pointers per entry) |

The linked list adds two extra pointer fields per entry compared to `HashSet`. For large sets, this overhead is measurable — but for typical application sizes it is negligible.

---

## Null Handling

Like `HashSet`, `LinkedHashSet` permits exactly one null element, and it participates in the insertion-order linked list:

```java
Set<String> set = new LinkedHashSet<>();
set.add("A");
set.add(null);
set.add("B");
set.add(null); // ignored

System.out.println(set); // [A, null, B]
```

---

## Thread Safety

`LinkedHashSet` is not thread-safe. For concurrent usage:

```java
Set<String> syncSet = Collections.synchronizedSet(new LinkedHashSet<>());
```

Iteration must still be synchronized externally:

```java
synchronized (syncSet) {
    for (String s : syncSet) {
        System.out.println(s);
    }
}
```

---

## LinkedHashSet vs HashSet vs TreeSet

| | `HashSet` | `LinkedHashSet` | `TreeSet` |
| --- | --- | --- | --- |
| Order | None | Insertion | Sorted |
| Performance | Fastest | Slightly slower | O(log n) |
| Memory | Lowest | Medium | Medium |
| Null | Yes (1) | Yes (1) | No |
| Use for | Speed | Ordered uniqueness | Sorted uniqueness |

---

## Key Takeaways

- `LinkedHashSet` maintains insertion order by linking entries in a doubly linked list
- Same O(1) average-time operations as `HashSet`, with a small memory overhead
- Ideal for ordered deduplication — converting a list with duplicates to a unique ordered list
- Allows one null element
- Not thread-safe — wrap with `Collections.synchronizedSet()` if needed

---

## Navigation

**← Previous:** [HashSet in Java](/java/hashset-in-java)

**Next →** [TreeSet in Java](/java/treeset-in-java)
