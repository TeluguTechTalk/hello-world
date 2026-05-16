---
layout: ../../layouts/BlogLayout.astro
title: Fail-Fast vs Fail-Safe Iterators in Java
tag: Java Collections Framework
description: Understand Java fail-fast and fail-safe iterators — how ConcurrentModificationException is triggered, which collections use which behavior, and how to handle concurrent iteration safely.
---

When a collection is structurally modified while you are iterating over it, the iterator must decide what to do. Java collections use one of two strategies: **fail-fast** (throw immediately) or **fail-safe** (silently continue on a snapshot). Understanding the difference prevents subtle bugs in concurrent and even single-threaded code.

---

## Fail-Fast Iterators

A fail-fast iterator **throws `ConcurrentModificationException`** as soon as it detects a structural modification to the collection that it did not make itself.

### How It Works

Collections like `ArrayList`, `HashMap`, and `HashSet` maintain an internal `modCount` counter. Every structural modification (add, remove, clear) increments `modCount`. The iterator captures `modCount` at creation time as `expectedModCount`. On each `next()` or `remove()` call, it checks:

```java
if (modCount != expectedModCount) {
    throw new ConcurrentModificationException();
}
```

### Example

```java
List<String> list = new ArrayList<>(List.of("Alice", "Bob", "Carol"));
Iterator<String> it = list.iterator();
it.next(); // "Alice"

list.add("Dave"); // structural modification — increments modCount

it.next(); // throws ConcurrentModificationException
```

Even in a **single-threaded** context, modifying the collection through the collection's own methods (not via the iterator) while iterating will throw.

### Which Collections Are Fail-Fast?

| Collection | Fail-Fast? |
| --- | --- |
| `ArrayList` | Yes |
| `LinkedList` | Yes |
| `HashMap` | Yes |
| `HashSet` | Yes |
| `LinkedHashMap` | Yes |
| `TreeMap` | Yes |
| `Vector` | Yes |
| `Hashtable` | Yes |

Essentially all classic `java.util` collections are fail-fast.

---

## Fail-Safe Iterators

A fail-safe iterator **does not throw** when the underlying collection is modified. It iterates over a **snapshot** (copy) of the collection taken at the time the iterator was created.

### Characteristics

- **No `ConcurrentModificationException`** — ever
- **May not reflect modifications** made after iteration started
- Higher memory use — maintains a copy of the data

### Which Collections Are Fail-Safe?

| Collection | Mechanism |
| --- | --- |
| `CopyOnWriteArrayList` | Iterator uses the array snapshot at creation time |
| `CopyOnWriteArraySet` | Same |
| `ConcurrentHashMap` | Iterator reflects state "at some point" — weakly consistent |

### CopyOnWriteArrayList — True Snapshot

```java
import java.util.concurrent.CopyOnWriteArrayList;

List<String> list = new CopyOnWriteArrayList<>(List.of("Alice", "Bob", "Carol"));
Iterator<String> it = list.iterator(); // snapshot taken here

list.add("Dave"); // modifies the live list — new array created

while (it.hasNext()) {
    System.out.println(it.next());
    // Prints: Alice, Bob, Carol
    // "Dave" is NOT visible — iterator holds old snapshot
}
System.out.println(list); // [Alice, Bob, Carol, Dave]
```

### ConcurrentHashMap — Weakly Consistent

`ConcurrentHashMap`'s iterator is weakly consistent: it **may or may not** reflect writes that happen concurrently with the iteration. It will never throw `ConcurrentModificationException`.

```java
import java.util.concurrent.ConcurrentHashMap;

ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
map.put("A", 1); map.put("B", 2); map.put("C", 3);

for (Map.Entry<String, Integer> e : map.entrySet()) {
    System.out.println(e.getKey()); // no exception
    map.put("D", 4); // may or may not be seen in this iteration
}
```

---

## Side-by-Side Comparison

| Feature | Fail-Fast | Fail-Safe |
| --- | --- | --- |
| Throws `ConcurrentModificationException`? | Yes | No |
| Iterates over | Live collection | Snapshot or weakly consistent view |
| Memory overhead | None (no copy) | Higher (copy of data) |
| Reflects concurrent changes? | N/A (throws first) | No (CopyOnWrite) or maybe (CHM) |
| Examples | `ArrayList`, `HashMap`, `HashSet` | `CopyOnWriteArrayList`, `ConcurrentHashMap` |
| Thread-safe collection? | Not required | Yes (these are concurrent collections) |

---

## Safe Modification Patterns

When using fail-fast collections and you need to remove during iteration:

### Pattern 1: Iterator.remove()

```java
List<String> list = new ArrayList<>(List.of("Alice", "Bob", "Carol"));
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (it.next().startsWith("B")) {
        it.remove(); // uses iterator — does NOT trigger fail-fast
    }
}
System.out.println(list); // [Alice, Carol]
```

### Pattern 2: removeIf() (Java 8)

```java
list.removeIf(s -> s.startsWith("B")); // cleanest single-threaded approach
```

### Pattern 3: Collect then Remove

```java
List<String> toRemove = list.stream()
    .filter(s -> s.startsWith("B"))
    .collect(Collectors.toList());
list.removeAll(toRemove);
```

### Pattern 4: Use a Concurrent Collection

```java
CopyOnWriteArrayList<String> cowList = new CopyOnWriteArrayList<>(list);
for (String s : cowList) {
    if (s.startsWith("B")) cowList.remove(s); // no exception
}
```

---

## The "Concurrent" in ConcurrentModificationException

Despite the name, `ConcurrentModificationException` **does not require multiple threads**. It is thrown whenever the collection's `modCount` changes while an iterator is active — even in single-threaded code:

```java
// Single-threaded — still throws!
List<String> list = new ArrayList<>(List.of("A", "B", "C"));
for (String s : list) {
    list.remove(s); // modCount changed — ConcurrentModificationException on next iteration
}
```

The word "concurrent" in the exception name refers to concurrent modification of the collection and the iteration — not concurrent threads.

---

## Key Takeaways

- Fail-fast iterators throw `ConcurrentModificationException` on structural modification detected via `modCount`
- All classic `java.util` collections (ArrayList, HashMap, etc.) are fail-fast
- Fail-safe iterators iterate over a snapshot or use weakly consistent semantics — no exception
- `CopyOnWriteArrayList` and `CopyOnWriteArraySet` are true snapshot iterators
- `ConcurrentHashMap` is weakly consistent — no exception, may or may not see new entries
- For safe removal: use `iterator.remove()`, `removeIf()`, or switch to a concurrent collection

---

## Navigation

**← Previous:** [Concurrent Collections](/java/concurrent-collections)

**Next →** [Synchronization in Collections](/java/synchronization-in-collections)
