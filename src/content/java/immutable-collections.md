---
layout: ../../layouts/BlogLayout.astro
title: Immutable Collections in Java
tag: Java Collections Framework
description: Learn Java immutable collections — Collections.unmodifiableXxx, Java 9+ factory methods, Guava immutables, thread safety guarantees, and when to choose immutability.
---

An **immutable collection** cannot be modified after creation — no adds, removes, or updates. Immutability eliminates entire classes of bugs related to shared mutable state, makes code easier to reason about, and provides free thread safety.

---

## Why Immutability Matters

```
Mutable shared state =
  Multiple owners +
  Any owner can change +
  No coordination required
  ↓
Race conditions, unexpected mutations, hard-to-trace bugs
```

An immutable collection can be passed freely between methods and threads with no defensive copying and no synchronization — it simply cannot change.

---

## Level 1: Collections.unmodifiableXxx (Java 1.2+)

`Collections.unmodifiableList()`, `unmodifiableSet()`, `unmodifiableMap()` return a **read-only view** of the backing collection. Mutating methods throw `UnsupportedOperationException`.

```java
List<String> mutable = new ArrayList<>(List.of("A", "B", "C"));
List<String> readOnly = Collections.unmodifiableList(mutable);

readOnly.get(0);      // "A" — OK
readOnly.add("D");    // UnsupportedOperationException
readOnly.remove(0);   // UnsupportedOperationException
```

**Critical limitation:** The backing collection can still be mutated, and the view reflects those changes:

```java
mutable.add("D");
System.out.println(readOnly.size()); // 4 — view changed!
```

This is a **view**, not a truly immutable collection. If you return `readOnly` from a method, callers cannot modify it via the reference, but the original list owner can. To truly prevent modification, you need a separate copy.

---

## Level 2: Java 9+ Factory Methods — Truly Immutable

Java 9 introduced `List.of()`, `Set.of()`, and `Map.of()` factory methods that return **genuinely immutable** collections:

```java
List<String> list = List.of("Alice", "Bob", "Carol");
Set<Integer> set  = Set.of(1, 2, 3, 4, 5);
Map<String, Integer> map = Map.of("Alice", 95, "Bob", 80);
```

These collections:
- Throw `UnsupportedOperationException` on any mutating call
- Do **not** allow null elements or null keys/values
- Have no separate backing collection — no way to mutate them indirectly
- Are **serializable**
- Have **no guaranteed iteration order** for `Set` and `Map`

```java
list.add("Dave");     // UnsupportedOperationException
set.remove(3);        // UnsupportedOperationException
map.put("Carol", 70); // UnsupportedOperationException
list.set(0, "Eve");   // UnsupportedOperationException
```

### List.copyOf, Set.copyOf, Map.copyOf (Java 10+)

Create an immutable copy from an existing collection:

```java
List<String> mutable = new ArrayList<>(List.of("A", "B", "C"));
List<String> immutable = List.copyOf(mutable);

mutable.add("D");
System.out.println(immutable.size()); // 3 — independent copy, not a view
```

This is the safe alternative to `Collections.unmodifiableList()` when you want truly immutable behaviour.

---

## Java 9+ Map.ofEntries — More Than 10 Pairs

`Map.of()` supports up to 10 key-value pairs. For more, use `Map.ofEntries()`:

```java
Map<String, Integer> map = Map.ofEntries(
    Map.entry("Alice", 95),
    Map.entry("Bob",   80),
    Map.entry("Carol", 70),
    Map.entry("Dave",  88),
    // ... up to any number
    Map.entry("Zara",  92)
);
```

---

## Comparison: unmodifiable vs Java 9 vs copyOf

| | `unmodifiableXxx` | `List.of()` / `Set.of()` | `List.copyOf()` |
| --- | --- | --- | --- |
| Truly immutable? | No (view) | Yes | Yes |
| Backed by original? | Yes | No | No (independent copy) |
| Null elements? | Allowed if backing allows | Not allowed | Not allowed |
| From existing collection? | Yes | No (fresh construction) | Yes |
| Available since | Java 1.2 | Java 9 | Java 10 |

---

## Thread Safety of Immutable Collections

Immutable collections are **inherently thread-safe** — no synchronization is needed because no thread can modify them. This is one of the most compelling reasons to prefer immutability for shared data:

```java
// Safe to share across threads — no synchronization needed
private static final List<String> CONFIG_FLAGS = List.of("flag1", "flag2", "flag3");

void processRequest() {
    for (String flag : CONFIG_FLAGS) { // no lock needed
        check(flag);
    }
}
```

---

## Defensive Copies

A common pattern when exposing fields that should not be modifiable by callers:

```java
public class Config {
    private final List<String> allowedHosts;

    public Config(List<String> hosts) {
        // Defensive copy at construction — we own this list
        this.allowedHosts = List.copyOf(hosts); // immutable copy
    }

    public List<String> getAllowedHosts() {
        return allowedHosts; // safe to return — callers cannot modify it
    }
}
```

Without `List.copyOf()`, the caller who passed `hosts` could mutate it later and affect `Config`'s internal state.

---

## Immutable Maps — Preserving Insertion Order

`Map.of()` does not guarantee iteration order. If you need ordered iteration in an immutable map, collect to a `LinkedHashMap` then wrap, or use `Map.copyOf()` on a `LinkedHashMap`:

```java
// Ordered immutable map (workaround — no single factory method preserves insertion order)
Map<String, Integer> ordered = new LinkedHashMap<>();
ordered.put("first",  1);
ordered.put("second", 2);
ordered.put("third",  3);
Map<String, Integer> immutableOrdered = Collections.unmodifiableMap(ordered);
// Note: unmodifiableMap is a view — the owner of `ordered` can still mutate it

// Truly immutable and ordered — use a copy
Map<String, Integer> trulyImmutable = Map.copyOf(ordered); // but order not guaranteed
```

For ordered+immutable, you currently need a third-party library like Guava.

---

## Guava Immutable Collections

Google Guava provides a separate immutable collection hierarchy with guaranteed value semantics, null rejection, and consistent ordering:

```java
import com.google.common.collect.*;

ImmutableList<String> list = ImmutableList.of("A", "B", "C");
ImmutableSet<String>  set  = ImmutableSet.of("X", "Y", "Z"); // insertion order preserved
ImmutableMap<String, Integer> map = ImmutableMap.of("Alice", 95, "Bob", 80);

// Builder pattern for larger collections
ImmutableList<String> built = ImmutableList.<String>builder()
    .add("A").add("B").addAll(someCollection)
    .build();
```

Guava's `ImmutableSet` preserves insertion order (unlike `Set.of()`), making it preferable when order matters.

---

## When to Use Immutable Collections

- **Constants and configuration** — lookup tables, allowed values, feature flags
- **Return values** — methods returning data that callers should not modify
- **Method arguments** — when callers should not be able to modify what they passed
- **Shared concurrent access** — eliminate synchronization overhead entirely
- **Value objects** — data objects that are safer when frozen

---

## Key Takeaways

- `Collections.unmodifiableXxx` creates a read-only view — the backing collection can still be mutated
- Java 9+ `List.of()`, `Set.of()`, `Map.of()` create truly immutable collections — no nulls, no guaranteed order for Set/Map
- `List.copyOf()`, `Set.copyOf()`, `Map.copyOf()` (Java 10+) create immutable copies from existing collections
- Immutable collections are inherently thread-safe — no synchronization needed
- Use defensive copies (`List.copyOf()`) when accepting or returning collections in public APIs

---

## Navigation

**← Previous:** [Synchronization in Collections](/java/synchronization-in-collections)

**Next →** [Collection Interview Questions](/java/collection-interview-questions)
