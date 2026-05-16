---
layout: ../../layouts/BlogLayout.astro
title: Java Collections Framework – Interview Questions
tag: Java Collections Framework
description: Top 25 Java Collections interview questions with detailed answers — covering ArrayList vs LinkedList, HashMap internals, fail-fast iterators, concurrency, sorting, and more.
---

This article covers the most frequently asked Java Collections interview questions, from fundamentals to deep internals. Each answer is written for clarity and depth — the kind of answer that demonstrates real understanding, not just surface-level recall.

---

## Q1. What is the Java Collections Framework and why was it introduced?

The Java Collections Framework (JCF) is a unified architecture for storing, retrieving, and manipulating groups of objects. It provides a hierarchy of interfaces (`Collection`, `List`, `Set`, `Queue`, `Map`), concrete implementations (`ArrayList`, `HashMap`, etc.), and utility algorithms (`Collections.sort`, etc.).

Before Java 1.2, Java had `Vector`, `Hashtable`, `Stack`, and raw arrays with no common interface — you could not write a method accepting "any kind of list." The JCF solved this by defining a common type hierarchy, enabling code reuse, algorithm portability, and type safety (enhanced further with generics in Java 5).

---

## Q2. What is the difference between Collection and Collections?

- **`Collection`** (interface, `java.util`) — the root interface for List, Set, and Queue. Defines common operations: `add`, `remove`, `size`, `iterator`, `contains`, etc.
- **`Collections`** (class, `java.util`) — a utility class of static helper methods: `sort`, `shuffle`, `binarySearch`, `unmodifiableList`, `synchronizedMap`, etc.

---

## Q3. What is the difference between ArrayList and LinkedList?

| | `ArrayList` | `LinkedList` |
| --- | --- | --- |
| Backing structure | Resizable array | Doubly linked list |
| `get(int)` | O(1) | O(n) |
| `add(E)` append | O(1) amortized | O(1) |
| `add(0, E)` prepend | O(n) | O(1) |
| Memory per element | ~4 bytes | ~32 bytes (node overhead) |
| Cache locality | Good | Poor |
| Implements | `List` | `List` + `Deque` |

In practice, `ArrayList` outperforms `LinkedList` for most workloads because modern CPUs heavily favor sequential memory access. Use `LinkedList` only when you need the `Deque` interface or measured that head-insertion is a bottleneck.

---

## Q4. How does HashMap work internally?

A `HashMap` stores entries in an array of buckets. When you call `put(key, value)`:

1. `hashCode()` is called on the key, then refined with `(h >>> 16) ^ h`
2. The bucket index is computed as `hash & (capacity - 1)`
3. If the bucket is empty, a new `Node` is placed there
4. If there are existing entries (collision), the key is compared with each using `equals()`. If a match is found, the value is updated; otherwise, a new node is appended
5. If `size / capacity > loadFactor (0.75)`, the table doubles in capacity and all entries are rehashed

Since Java 8, a bucket's linked list is converted to a red-black tree when it contains 8 or more entries — improving worst-case lookup from O(n) to O(log n).

---

## Q5. What is the default capacity and load factor of HashMap?

- Default initial capacity: **16**
- Default load factor: **0.75**

When `size / capacity > 0.75`, the map rehashes — allocates a new array of double the size and re-buckets all entries. To avoid rehashing when the entry count is known in advance, pre-size with: `new HashMap<>((int)(expectedEntries / 0.75) + 1)`.

---

## Q6. What is the difference between HashMap and Hashtable?

| | `HashMap` | `Hashtable` |
| --- | --- | --- |
| Thread safety | Not synchronized | All methods synchronized |
| Null key | 1 allowed | Not allowed |
| Null value | Multiple allowed | Not allowed |
| Performance | Faster | Slower |
| Introduced | Java 1.2 | Java 1.0 |
| Recommended? | Yes | No — use `ConcurrentHashMap` |

`Hashtable` is a legacy class. For concurrent maps, use `ConcurrentHashMap` — it offers much better throughput through fine-grained locking.

---

## Q7. What is the difference between HashMap and ConcurrentHashMap?

`HashMap` is not thread-safe — concurrent modification causes data corruption. `ConcurrentHashMap` is designed for concurrent access:

- In Java 8+, reads are completely lock-free (using `volatile` and CAS)
- Writes lock only the specific bucket being modified
- Provides atomic compound operations: `putIfAbsent`, `computeIfAbsent`, `merge`
- Does not allow null keys or null values

For all multi-threaded map usage, prefer `ConcurrentHashMap` over `HashMap` + `synchronized` block.

---

## Q8. What happens if two keys have the same hashCode?

They are placed in the same bucket — a **hash collision**. The bucket then holds a linked list (or tree in Java 8+ for large buckets) of all entries with that hash. `get()` traverses the bucket list and uses `equals()` to find the correct entry.

If all keys hash to the same value (a deliberately crafted attack or a poor `hashCode()` implementation), lookups degrade to O(n) — or O(log n) with Java 8's treeification.

---

## Q9. What is the contract between equals() and hashCode()?

- If `a.equals(b)` is `true`, then `a.hashCode()` must equal `b.hashCode()`
- The reverse is not required — equal hashCodes do not imply equality (collisions are allowed)

Violating this contract corrupts `HashMap`, `HashSet`, and any hash-based collection: objects that are logically equal may be placed in different buckets and never found by lookup operations.

---

## Q10. What is the difference between fail-fast and fail-safe iterators?

**Fail-fast:** Most `java.util` collections (ArrayList, HashMap, etc.) track a `modCount`. If the collection is structurally modified outside the iterator while iterating, the next `next()` call throws `ConcurrentModificationException`.

**Fail-safe:** `java.util.concurrent` collections like `CopyOnWriteArrayList` iterate over a snapshot taken at iterator creation time. No exception is thrown, but changes made after iteration starts may not be visible.

---

## Q11. What is the difference between Iterator and ListIterator?

`Iterator` works on any `Collection`, traverses forward only, and supports `remove()`.

`ListIterator` works on `List` only, traverses both forward and backward, and additionally supports `add()`, `set()`, `nextIndex()`, and `previousIndex()`.

---

## Q12. What is the difference between HashSet and TreeSet?

| | `HashSet` | `TreeSet` |
| --- | --- | --- |
| Order | None | Sorted (natural or Comparator) |
| Performance | O(1) average | O(log n) |
| Null | 1 allowed | Not allowed |
| Backed by | `HashMap` | `TreeMap` (red-black tree) |
| Use for | Fast membership test | Sorted unique elements |

Use `HashSet` when you only need unique elements and order does not matter. Use `TreeSet` when you need sorted iteration or range queries.

---

## Q13. What is the difference between Comparable and Comparator?

`Comparable` is implemented by the class itself (`compareTo(T other)`) to define its natural ordering. `Comparator` is an external strategy (`compare(T o1, T o2)`) for custom or multiple orderings.

Use `Comparable` for the one obvious ordering intrinsic to the class (e.g., `Integer` sorts by value). Use `Comparator` when you do not own the class, need multiple orderings, or want null-safe/reversed comparisons.

---

## Q14. What is the difference between List.of() and Collections.unmodifiableList()?

`Collections.unmodifiableList(list)` returns a **view** — mutating calls on the view throw `UnsupportedOperationException`, but the underlying `list` can still be changed, and the view reflects those changes.

`List.of(...)` (Java 9+) returns a **truly immutable** list backed by no mutable collection. It does not allow null elements and provides no way to modify the contents at all.

---

## Q15. How does LinkedHashMap implement an LRU cache?

By constructing `LinkedHashMap` with `accessOrder = true` (third constructor argument), each `get()` moves the accessed entry to the tail of the internal doubly linked list. Entries at the head are least-recently used.

Override `removeEldestEntry()` to evict the head entry when `size() > maxCapacity`. This gives you a fully functional O(1) LRU cache:

```java
new LinkedHashMap<K, V>(capacity, 0.75f, true) {
    protected boolean removeEldestEntry(Map.Entry<K,V> eldest) {
        return size() > maxCapacity;
    }
};
```

---

## Q16. What is the difference between PriorityQueue and TreeSet for a sorted structure?

| | `PriorityQueue` | `TreeSet` |
| --- | --- | --- |
| Interface | `Queue` | `NavigableSet` |
| Duplicates | Allowed | Not allowed |
| Peek min | O(1) | O(log n) |
| Remove any | O(n) | O(log n) |
| Use for | Top-K, Dijkstra, streaming min/max | Sorted unique elements |

Use `PriorityQueue` when you need the minimum/maximum repeatedly and duplicates are allowed. Use `TreeSet` when you need sorted unique elements and range operations.

---

## Q17. What is the difference between ArrayDeque and LinkedList as a Queue?

`ArrayDeque` is backed by a resizable circular array — faster than `LinkedList` because of better cache locality and no per-element `Node` allocation. It does not allow null elements. For pure queue (or stack) use, always prefer `ArrayDeque`.

`LinkedList` implements both `List` and `Deque` — use it only when you need both interfaces on the same object.

---

## Q18. Why should you use ConcurrentHashMap instead of synchronizedMap?

`Collections.synchronizedMap()` uses a single lock for the entire map — all operations are serialized. Under contention, performance degrades badly.

`ConcurrentHashMap` uses fine-grained locking (per bucket in Java 8, with CAS for reads). Multiple threads can read and write to different buckets simultaneously. It also provides built-in atomic compound methods (`putIfAbsent`, `computeIfAbsent`, `merge`) that avoid external synchronization for common patterns.

---

## Q19. What is CopyOnWriteArrayList and when should you use it?

`CopyOnWriteArrayList` creates a new copy of the internal array on every write operation. Reads operate on the old snapshot and are lock-free.

Use it for **read-dominated** lists that rarely change — event listener lists, observer lists, configuration snapshots. Avoid it for write-heavy workloads — every write allocates and copies the entire array.

---

## Q20. What is the difference between Vector and ArrayList?

Both implement `List` with a resizable array. Differences:

- `Vector` was introduced in Java 1.0; `ArrayList` in Java 1.2
- `Vector` is synchronized (all methods); `ArrayList` is not
- `Vector` grows by 2× (or by `capacityIncrement`); `ArrayList` grows by ~1.5×
- `Vector` has legacy methods (`addElement`, `elementAt`, etc.); `ArrayList` does not
- `ArrayList` is faster in single-threaded code due to no synchronization overhead

Use `ArrayList` for new code. Use `Vector` only in legacy code or when maintaining `Stack`.

---

## Q21. What is treeification in Java 8 HashMap?

Before Java 8, hash collisions created linked lists per bucket. A worst-case attack could make all keys hash to the same bucket, degrading all lookups to O(n).

Java 8 converts a bucket's linked list to a red-black tree when the bucket contains **8 or more entries** AND the table has at least **64 slots**. Tree-bucketed lookups run in O(log n) worst-case. The tree reverts to a linked list when the bucket shrinks below **6 entries**.

---

## Q22. Can we use a mutable object as a HashMap key? What happens if we do?

You can, but it is dangerous. `HashMap` computes the bucket index from `hashCode()` at insertion time. If you mutate the key object afterward, its `hashCode()` changes — and the entry ends up "lost" in the wrong bucket.

```java
List<Integer> key = new ArrayList<>(List.of(1, 2));
map.put(key, "value");
key.add(3); // key's hashCode changes
map.get(key); // returns null — entry is unfindable
```

Always use immutable objects (strings, integers, enums, or custom immutable classes) as map keys.

---

## Q23. What is the internal difference between HashMap and LinkedHashMap?

`LinkedHashMap.Entry<K,V>` extends `HashMap.Node<K,V>` by adding two extra fields: `Entry<K,V> before` and `Entry<K,V> after`. These form a doubly linked list through all entries in insertion order (or access order when constructed with `accessOrder = true`). The hash table provides O(1) lookup; the linked list provides consistent iteration order.

---

## Q24. What is the difference between the Queue methods offer/poll/peek vs add/remove/element?

Both sets perform the same logical operations, but they behave differently on boundary conditions:

| Operation | Throws Exception | Returns Special Value |
| --- | --- | --- |
| Insert | `add(e)` — `IllegalStateException` if full | `offer(e)` — returns `false` |
| Remove head | `remove()` — `NoSuchElementException` if empty | `poll()` — returns `null` |
| Examine head | `element()` — `NoSuchElementException` if empty | `peek()` — returns `null` |

Prefer `offer`, `poll`, `peek` in application code — they compose more cleanly with conditional logic.

---

## Q25. How do you sort a list of objects by multiple fields?

Use `Comparator.comparing()` chained with `thenComparing()`:

```java
List<Employee> employees = ...;

employees.sort(
    Comparator.comparing((Employee e) -> e.department)
              .thenComparingInt(e -> e.salary)
              .thenComparing(e -> e.name)
);
```

This sorts first by department, then by salary within the same department, then by name within the same department and salary. All chainable comparators return a new `Comparator` — the chain is evaluated left to right.

---

## Quick Reference: Which Collection When?

| Need | Use |
| --- | --- |
| Ordered list, fast reads | `ArrayList` |
| Ordered list, fast head insert | `LinkedList` or `ArrayDeque` |
| Unique elements, fast lookup | `HashSet` |
| Unique elements, insertion order | `LinkedHashSet` |
| Unique elements, sorted | `TreeSet` |
| Key-value, fast lookup | `HashMap` |
| Key-value, insertion order | `LinkedHashMap` |
| Key-value, sorted keys | `TreeMap` |
| FIFO queue | `ArrayDeque` |
| Priority queue | `PriorityQueue` |
| Concurrent map | `ConcurrentHashMap` |
| Concurrent read-heavy list | `CopyOnWriteArrayList` |
| Blocking producer-consumer | `LinkedBlockingQueue` |
| LRU cache | `LinkedHashMap` (access order) |

---

## Navigation

**← Previous:** [Immutable Collections](/java/immutable-collections)

**← Back to Overview:** [Collections Framework Overview](/java/collections-framework-overview)
