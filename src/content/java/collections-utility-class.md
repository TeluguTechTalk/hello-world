---
layout: ../../layouts/BlogLayout.astro
title: The Collections Utility Class in Java
tag: Java Collections Framework
description: Learn java.util.Collections — sorting, searching, shuffling, frequency, min/max, unmodifiable wrappers, synchronized wrappers, singleton collections, and nCopies.
---

`java.util.Collections` is a utility class of **static methods** that operate on or return collections. It provides ready-made algorithms and wrappers that work on any `Collection` or `List` — no need to reimplement sorting, searching, or thread-safety patterns yourself.

---

## Sorting

### sort()

```java
import java.util.Collections;
import java.util.List;
import java.util.ArrayList;

List<Integer> nums = new ArrayList<>(List.of(5, 3, 8, 1, 9, 2));
Collections.sort(nums);
System.out.println(nums); // [1, 2, 3, 5, 8, 9]

// With Comparator
Collections.sort(nums, Comparator.reverseOrder());
System.out.println(nums); // [9, 8, 5, 3, 2, 1]
```

Uses a stable merge sort (TimSort) — equal elements retain their original order.

### reverse()

```java
List<String> list = new ArrayList<>(List.of("A", "B", "C", "D"));
Collections.reverse(list);
System.out.println(list); // [D, C, B, A]
```

### shuffle()

```java
List<Integer> deck = new ArrayList<>();
for (int i = 1; i <= 52; i++) deck.add(i);

Collections.shuffle(deck);                        // random shuffle
Collections.shuffle(deck, new Random(42));         // seeded for reproducibility
```

### rotate()

Rotates elements to the right by distance positions:

```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3, 4, 5));
Collections.rotate(list, 2);
System.out.println(list); // [4, 5, 1, 2, 3]
```

---

## Searching

### binarySearch()

The list must be **sorted** before calling `binarySearch()`. Returns the index if found, or `-(insertion point) - 1` if not found.

```java
List<Integer> sorted = new ArrayList<>(List.of(1, 3, 5, 7, 9));
int idx = Collections.binarySearch(sorted, 5); // 2
int missing = Collections.binarySearch(sorted, 6); // -4 (would be inserted at index 3)

// With Comparator
List<String> words = new ArrayList<>(List.of("apple", "cherry", "mango"));
Collections.sort(words);
int i = Collections.binarySearch(words, "cherry"); // 1
```

---

## Min and Max

```java
List<Integer> nums = List.of(3, 1, 4, 1, 5, 9, 2, 6);

int min = Collections.min(nums); // 1
int max = Collections.max(nums); // 9

// With Comparator
List<String> words = List.of("banana", "apple", "cherry");
String shortest = Collections.min(words, Comparator.comparingInt(String::length)); // apple
```

---

## frequency() and disjoint()

```java
List<String> list = List.of("A", "B", "A", "C", "A");
int count = Collections.frequency(list, "A"); // 3

List<Integer> a = List.of(1, 2, 3);
List<Integer> b = List.of(4, 5, 6);
List<Integer> c = List.of(3, 4, 5);

System.out.println(Collections.disjoint(a, b)); // true  — no common elements
System.out.println(Collections.disjoint(a, c)); // false — 3 is common
```

---

## fill() and copy()

```java
List<String> list = new ArrayList<>(List.of("A", "B", "C"));
Collections.fill(list, "X");
System.out.println(list); // [X, X, X]

List<String> src = List.of("1", "2", "3");
List<String> dest = new ArrayList<>(List.of("A", "B", "C", "D"));
Collections.copy(dest, src); // dest must be at least as large as src
System.out.println(dest); // [1, 2, 3, D]
```

---

## nCopies()

Returns an immutable list with n copies of a specified object. Useful for initializing lists:

```java
List<String> fives = Collections.nCopies(5, "default");
System.out.println(fives); // [default, default, default, default, default]

// Common pattern: initialize a mutable list with a default value
List<Integer> zeros = new ArrayList<>(Collections.nCopies(10, 0));
```

---

## Singleton Collections

Returns immutable collections with exactly one element. Useful for passing a single element where a collection is expected:

```java
Set<String> one = Collections.singleton("Alice");
List<String> oneList = Collections.singletonList("Alice");
Map<String, Integer> oneMap = Collections.singletonMap("Alice", 95);

// Useful in API calls that expect a collection
someApi.deleteAll(Collections.singletonList(userId));
```

---

## Unmodifiable Wrappers

Returns a view of the collection that throws `UnsupportedOperationException` for all mutating operations. The backing collection can still be modified — this is just a read-only view:

```java
List<String> mutable = new ArrayList<>(List.of("A", "B", "C"));
List<String> readOnly = Collections.unmodifiableList(mutable);

readOnly.add("D"); // throws UnsupportedOperationException

mutable.add("D");  // original list can still be changed
System.out.println(readOnly); // [A, B, C, D] — reflects the change
```

Also available for: `unmodifiableSet`, `unmodifiableMap`, `unmodifiableSortedSet`, `unmodifiableSortedMap`, `unmodifiableCollection`.

For a **truly immutable** list, use Java 9+ factory methods: `List.of(...)`, `Set.of(...)`, `Map.of(...)`.

---

## Synchronized Wrappers

Returns a thread-safe view where every method is wrapped in a `synchronized` block. Compound operations still require explicit synchronization:

```java
List<String> synced = Collections.synchronizedList(new ArrayList<>());
Set<String>  syncSet = Collections.synchronizedSet(new HashSet<>());
Map<String, Integer> syncMap = Collections.synchronizedMap(new HashMap<>());

// Single operations are safe
synced.add("Alice");

// Compound operations still need synchronization
synchronized (synced) {
    if (!synced.contains("Bob")) {
        synced.add("Bob");
    }
}

// Iteration must be synchronized
synchronized (synced) {
    for (String s : synced) {
        System.out.println(s);
    }
}
```

For high-concurrency code, prefer `ConcurrentHashMap`, `CopyOnWriteArrayList`, or other `java.util.concurrent` classes over these wrappers.

---

## Empty Collections

Return immutable empty collections without allocating new objects (reuses singletons):

```java
List<String>      emptyList = Collections.emptyList();
Set<String>       emptySet  = Collections.emptySet();
Map<String, Long> emptyMap  = Collections.emptyMap();

// Useful as safe default returns
public List<Order> getOrders(String userId) {
    List<Order> found = orderRepo.find(userId);
    return found != null ? found : Collections.emptyList();
}
```

---

## swap() and replaceAll()

```java
List<String> list = new ArrayList<>(List.of("A", "B", "C"));
Collections.swap(list, 0, 2);
System.out.println(list); // [C, B, A]

Collections.replaceAll(list, "B", "X");
System.out.println(list); // [C, X, A]
```

---

## Key Takeaways

- `Collections` is a utility class of static algorithms — no instantiation needed
- Sorting: `sort`, `reverse`, `shuffle`, `rotate`
- Searching: `binarySearch` (list must be sorted first), `min`, `max`, `frequency`, `disjoint`
- Wrappers: `unmodifiableXxx` for read-only views, `synchronizedXxx` for thread-safe access
- Constants: `emptyList()`, `emptySet()`, `emptyMap()` return shared immutable empties
- For truly immutable collections, prefer Java 9+ `List.of()`, `Set.of()`, `Map.of()`

---

## Navigation

**← Previous:** [Iterator vs ListIterator](/java/iterator-vs-listiterator)

**Next →** [Concurrent Collections](/java/concurrent-collections)
