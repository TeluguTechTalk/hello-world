---
layout: ../../layouts/BlogLayout.astro
title: Iterator vs ListIterator in Java
tag: Java Collections Framework
description: Understand Java Iterator and ListIterator — traversal direction, safe removal, add/set operations, ConcurrentModificationException, and when to use each.
---

`Iterator` and `ListIterator` are the two cursor interfaces for traversing collections in Java. `Iterator` moves forward through any `Collection`; `ListIterator` moves in both directions through a `List` and supports modification during traversal.

---

## Iterator

`Iterator<E>` is in `java.util`. Every `Collection` returns one via `iterator()`. It provides three methods:

```java
public interface Iterator<E> {
    boolean hasNext();   // true if more elements remain
    E next();            // returns next element and advances cursor
    void remove();       // removes the last element returned by next()
}
```

### Basic Usage

```java
List<String> names = new ArrayList<>(List.of("Alice", "Bob", "Carol"));
Iterator<String> it = names.iterator();

while (it.hasNext()) {
    String name = it.next();
    System.out.println(name);
}
```

### Safe Removal During Traversal

`Iterator.remove()` is the only safe way to remove elements while iterating:

```java
List<String> names = new ArrayList<>(List.of("Alice", "Bob", "Carol", "Dave"));
Iterator<String> it = names.iterator();

while (it.hasNext()) {
    String name = it.next();
    if (name.startsWith("C") || name.startsWith("D")) {
        it.remove(); // removes the element last returned by next()
    }
}
System.out.println(names); // [Alice, Bob]
```

**`remove()` without `next()` first throws `IllegalStateException`.**

---

## ListIterator

`ListIterator<E>` extends `Iterator<E>` and is specific to `List`. It adds:

- **Bidirectional traversal** — `hasPrevious()` and `previous()`
- **Index access** — `nextIndex()` and `previousIndex()`
- **Modification** — `add(E)` and `set(E)` during traversal

```java
public interface ListIterator<E> extends Iterator<E> {
    boolean hasNext();
    E next();
    void remove();

    boolean hasPrevious();
    E previous();
    int nextIndex();
    int previousIndex();
    void add(E e);
    void set(E e);
}
```

### Bidirectional Traversal

```java
List<String> list = new ArrayList<>(List.of("A", "B", "C", "D"));
ListIterator<String> lit = list.listIterator();

// Forward
while (lit.hasNext()) {
    System.out.print(lit.next() + " "); // A B C D
}

// Reverse (cursor is now at the end)
while (lit.hasPrevious()) {
    System.out.print(lit.previous() + " "); // D C B A
}
```

### In-Place Modification with set()

```java
List<String> names = new ArrayList<>(List.of("alice", "bob", "carol"));
ListIterator<String> lit = names.listIterator();

while (lit.hasNext()) {
    String name = lit.next();
    lit.set(name.substring(0, 1).toUpperCase() + name.substring(1)); // capitalize
}
System.out.println(names); // [Alice, Bob, Carol]
```

### Inserting with add()

```java
List<Integer> nums = new ArrayList<>(List.of(1, 3, 5));
ListIterator<Integer> lit = nums.listIterator();

while (lit.hasNext()) {
    int n = lit.next();
    lit.add(n + 1); // insert after current element
}
System.out.println(nums); // [1, 2, 3, 4, 5, 6]
```

### Starting at a Specific Position

```java
List<String> list = List.of("A", "B", "C", "D", "E");
ListIterator<String> lit = list.listIterator(3); // start before index 3

lit.next();     // "D"
lit.previous(); // "D" again
lit.previous(); // "C"
```

---

## Iterator vs ListIterator Comparison

| Feature | `Iterator` | `ListIterator` |
| --- | --- | --- |
| Direction | Forward only | Forward and backward |
| Works with | Any `Collection` | `List` only |
| Obtained via | `collection.iterator()` | `list.listIterator()` |
| `remove()` | Yes (removes last `next()`) | Yes |
| `add(E)` | No | Yes (inserts before `next()` position) |
| `set(E)` | No | Yes (replaces last returned element) |
| Index query | No | `nextIndex()`, `previousIndex()` |
| Fail-fast | Yes | Yes |

---

## Fail-Fast Iterators and ConcurrentModificationException

Most collection iterators are **fail-fast**: they track a `modCount` field on the collection. If the collection is structurally modified (add or remove outside the iterator) while iterating, the next `next()` or `previous()` call throws `ConcurrentModificationException`.

```java
List<String> list = new ArrayList<>(List.of("A", "B", "C"));
Iterator<String> it = list.iterator();
it.next(); // "A"

list.add("D"); // structural modification outside iterator

it.next(); // throws ConcurrentModificationException
```

**Safe patterns:**

```java
// 1. Use iterator's own remove()
it.remove(); // OK

// 2. removeIf (Java 8) — cleaner
list.removeIf(s -> s.equals("B"));

// 3. Collect then remove
List<String> toRemove = list.stream().filter(s -> s.equals("B")).collect(Collectors.toList());
list.removeAll(toRemove);

// 4. CopyOnWriteArrayList — fail-safe, iterates over a snapshot
List<String> cow = new CopyOnWriteArrayList<>(List.of("A", "B", "C"));
for (String s : cow) {
    cow.add("D"); // no exception — iterates the snapshot
}
```

---

## The Enhanced For Loop

The enhanced for loop (`for (T x : collection)`) is syntactic sugar for `Iterator`:

```java
for (String name : names) {
    System.out.println(name);
}
// Compiles to:
Iterator<String> it = names.iterator();
while (it.hasNext()) {
    String name = it.next();
    System.out.println(name);
}
```

Since the for-each loop hides the iterator, you cannot call `it.remove()` inside it. If you need removal, use the explicit iterator form.

---

## Key Takeaways

- `Iterator` — forward-only traversal, safe removal via `remove()`, works on any `Collection`
- `ListIterator` — bidirectional, supports `add()` and `set()`, `List` only
- Both are fail-fast — structural changes outside the iterator throw `ConcurrentModificationException`
- Safe removal patterns: `iterator.remove()`, `removeIf()`, or `CopyOnWriteArrayList`
- Enhanced for loop is iterator under the hood — use explicit iterator when you need to remove

---

## Navigation

**← Previous:** [Comparable vs Comparator](/java/comparable-vs-comparator)

**Next →** [The Collections Utility Class](/java/collections-utility-class)
