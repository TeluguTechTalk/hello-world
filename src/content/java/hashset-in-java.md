---
layout: ../../layouts/BlogLayout.astro
title: HashSet in Java – Complete Guide
tag: Java Collections Framework
description: Deep dive into Java HashSet — how it works internally, the hashCode and equals contract, performance characteristics, null handling, and common pitfalls.
---

`HashSet` is the most commonly used `Set` implementation. It provides O(1) average-time performance for `add`, `remove`, and `contains` by storing elements in a hash table. It makes no guarantees about the order of iteration.

---

## Internal Implementation

`HashSet` is backed by a `HashMap`. Every element you add to the `HashSet` becomes a key in the underlying `HashMap`, and the value is always a constant dummy object (`PRESENT`):

```java
// Simplified view of HashSet internals
private transient HashMap<E, Object> map;
private static final Object PRESENT = new Object();

public boolean add(E e) {
    return map.put(e, PRESENT) == null;
}

public boolean contains(Object o) {
    return map.containsKey(o);
}

public boolean remove(Object o) {
    return map.remove(o) == PRESENT;
}
```

This means all the behaviour of `HashSet` is driven by `HashMap` — including capacity, load factor, bucket selection, and rehashing.

---

## Creating a HashSet

```java
import java.util.HashSet;
import java.util.Set;

// Default — initial capacity 16, load factor 0.75
Set<String> set = new HashSet<>();

// Pre-sized — good if you know the approximate count
Set<String> set2 = new HashSet<>(100);

// Pre-sized with custom load factor
Set<String> set3 = new HashSet<>(100, 0.5f);

// From a collection — deduplicates automatically
List<String> withDups = List.of("A", "B", "A", "C");
Set<String> deduped = new HashSet<>(withDups); // {A, B, C}
```

---

## Common Operations

```java
Set<String> set = new HashSet<>();

// Add — returns true if the element was new
set.add("Alice");   // true
set.add("Bob");     // true
set.add("Alice");   // false — already present

// Remove
set.remove("Bob");  // true — removed
set.remove("Dave"); // false — not found

// Contain check
set.contains("Alice"); // true

// Size
set.size(); // 1

// Iterate (order not guaranteed)
for (String s : set) {
    System.out.println(s);
}

// Convert to sorted list
List<String> sorted = new ArrayList<>(set);
Collections.sort(sorted);
```

---

## The hashCode / equals Contract

`HashSet` determines element equality using `hashCode()` first (to find the bucket), then `equals()` (to confirm identity within the bucket). For this to work correctly:

- If `a.equals(b)` is `true`, then `a.hashCode()` must equal `b.hashCode()`
- If `a.hashCode()` equals `b.hashCode()`, `a.equals(b)` may or may not be `true` (collision)

```java
public class Product {
    private final String sku;
    private String name;

    public Product(String sku, String name) {
        this.sku = sku;
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Product p)) return false;
        return Objects.equals(sku, p.sku); // identity by SKU only
    }

    @Override
    public int hashCode() {
        return Objects.hash(sku); // must match equals contract
    }
}

Set<Product> catalog = new HashSet<>();
catalog.add(new Product("SKU-1", "Widget"));
catalog.add(new Product("SKU-1", "Widget Revised")); // same SKU — not added
System.out.println(catalog.size()); // 1
```

---

## Null Handling

`HashSet` allows exactly **one null** element. The null is stored in bucket 0.

```java
Set<String> set = new HashSet<>();
set.add(null);   // allowed
set.add(null);   // ignored — already present
set.add("A");

System.out.println(set.size());       // 2
System.out.println(set.contains(null)); // true
set.remove(null);
System.out.println(set.size());       // 1
```

---

## Performance

| Operation | Average | Worst (many hash collisions) |
| --- | --- | --- |
| `add(E)` | O(1) | O(n) |
| `contains(Object)` | O(1) | O(n) |
| `remove(Object)` | O(1) | O(n) |
| Iteration | O(capacity + size) | — |

**Load factor and rehashing:** The default load factor is `0.75`. When `size / capacity > 0.75`, the table is rehashed to double the capacity. A lower load factor improves lookup speed at the cost of more memory; a higher load factor saves memory but increases collision probability.

---

## HashSet vs LinkedHashSet vs TreeSet

| | `HashSet` | `LinkedHashSet` | `TreeSet` |
| --- | --- | --- | --- |
| Order | None | Insertion | Sorted |
| `add/contains/remove` | O(1) avg | O(1) avg | O(log n) |
| Null | 1 allowed | 1 allowed | Not allowed |
| Memory | Lowest | Medium | Highest |

---

## Common Mistakes

**Not overriding `hashCode()` when overriding `equals()`:**

```java
public class Bad {
    String name;
    @Override public boolean equals(Object o) {
        return o instanceof Bad b && name.equals(b.name);
    }
    // hashCode NOT overridden — uses Object.hashCode() (identity hash)
}

Set<Bad> set = new HashSet<>();
set.add(new Bad("Alice"));
set.add(new Bad("Alice")); // NOT treated as duplicate — different hash buckets
System.out.println(set.size()); // 2 — wrong
```

**Mutating a stored object:**

```java
Set<List<Integer>> set = new HashSet<>();
List<Integer> key = new ArrayList<>(List.of(1, 2));
set.add(key);
key.add(3); // changes hashCode
System.out.println(set.contains(key)); // false — lost track of it
```

---

## Key Takeaways

- `HashSet` is backed by `HashMap` — all performance characteristics derive from it
- O(1) average for add, remove, contains — O(n) worst case on hash collision
- Allows one `null` element
- Override both `equals()` and `hashCode()` for custom types
- Never mutate objects after adding them to a `HashSet`
- No iteration order guarantee — use `LinkedHashSet` or `TreeSet` if order matters

---

## Navigation

**← Previous:** [The Set Interface](/java/set-interface)

**Next →** [LinkedHashSet in Java](/java/linkedhashset-in-java)
