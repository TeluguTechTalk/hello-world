---
layout: ../../layouts/BlogLayout.astro
title: Synchronization in Collections in Java
tag: Java Collections Framework
description: Learn how to safely use collections in multi-threaded Java — synchronized wrappers, explicit locking, compound operations, pitfalls, and when to prefer concurrent collections.
---

Synchronization in Java collections is about ensuring that multiple threads can read and write shared data without race conditions, data corruption, or visibility failures. Java offers several mechanisms — from coarse synchronized wrappers to fine-grained concurrent data structures.

---

## Why Collections Are Not Thread-Safe by Default

The standard `java.util` collections (ArrayList, HashMap, HashSet, etc.) are designed for single-threaded use. They make no synchronization guarantees because:

1. Synchronization adds CPU overhead — you pay the cost even when only one thread accesses the collection
2. The right granularity depends on the use case — a coarse lock is often wrong

If two threads modify an `ArrayList` concurrently without synchronization, you can get:

- **Lost updates** — one thread's write overwrites another's
- **Corrupted internal state** — e.g., `size` field out of sync with actual array contents
- **Infinite loops** — pre-Java 8 `HashMap` could form a cycle in the bucket linked list during concurrent resize
- **Stale reads** — without a memory barrier, one thread may not see another's writes

---

## Collections.synchronizedXxx Wrappers

The quickest way to make a collection thread-safe is to wrap it:

```java
import java.util.Collections;

List<String>      syncList = Collections.synchronizedList(new ArrayList<>());
Set<String>       syncSet  = Collections.synchronizedSet(new HashSet<>());
Map<String, Long> syncMap  = Collections.synchronizedMap(new HashMap<>());
```

Every method call on the wrapper acquires the same intrinsic lock (the wrapper object itself). This serializes all access — only one thread can execute any single method at a time.

### What This Covers

Single operations are safe:

```java
syncList.add("Alice");    // safe
syncMap.get("Alice");     // safe
syncSet.contains("Bob");  // safe
```

### What This Does NOT Cover: Compound Operations

Check-then-act sequences are still not atomic:

```java
// NOT ATOMIC — two threads can both pass the contains check before either add
if (!syncList.contains("Alice")) {
    syncList.add("Alice"); // race condition here
}

// SAFE — explicit synchronization around the compound operation
synchronized (syncList) {
    if (!syncList.contains("Alice")) {
        syncList.add("Alice");
    }
}
```

### Iteration Must Be Synchronized

The `Collections.synchronizedXxx` wrappers do not synchronize iteration — you must do this yourself:

```java
synchronized (syncList) {
    for (String s : syncList) {
        System.out.println(s); // safe — holds the lock throughout
    }
}
```

Without the `synchronized` block, another thread can modify `syncList` between iterations, causing `ConcurrentModificationException`.

---

## Explicit Synchronization with synchronized Blocks

You can protect any collection with an explicit lock:

```java
private final List<String> items = new ArrayList<>();
private final Object lock = new Object();

public void add(String item) {
    synchronized (lock) {
        items.add(item);
    }
}

public boolean removeIfPresent(String item) {
    synchronized (lock) {
        return items.remove(item);
    }
}

public void processAll() {
    synchronized (lock) {
        for (String item : items) {
            process(item);
        }
    }
}
```

This is functionally equivalent to `synchronizedList` but allows you to control the lock object and lock scope.

---

## ReadWriteLock for Read-Heavy Workloads

If reads are much more frequent than writes, a `ReadWriteLock` allows concurrent reads while still serializing writes:

```java
import java.util.concurrent.locks.ReentrantReadWriteLock;

private final List<String> items = new ArrayList<>();
private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();

public List<String> getAll() {
    rwLock.readLock().lock();
    try {
        return new ArrayList<>(items); // snapshot under read lock
    } finally {
        rwLock.readLock().unlock();
    }
}

public void add(String item) {
    rwLock.writeLock().lock();
    try {
        items.add(item);
    } finally {
        rwLock.writeLock().unlock();
    }
}
```

Multiple threads can hold the read lock simultaneously. Only one thread can hold the write lock, and it excludes all readers.

---

## synchronized vs Concurrent Collections

| | `Collections.synchronizedXxx` | Concurrent (java.util.concurrent) |
| --- | --- | --- |
| Locking | One lock for entire structure | Fine-grained or lock-free |
| Concurrent reads | Blocked by any operation | Usually allowed (lock-free) |
| Compound operations | Must synchronize manually | Many atomic methods built-in |
| Iteration | Must synchronize manually | Fail-safe (snapshot or weakly consistent) |
| Performance under contention | Poor | Excellent |
| Complexity | Low | Medium |

For any meaningful concurrency, prefer `ConcurrentHashMap` over `synchronizedMap(new HashMap<>())`.

---

## Common Pitfalls

### 1. Synchronizing on the Wrong Object

```java
List<String> list = Collections.synchronizedList(new ArrayList<>());

// WRONG — synchronizing on `this`, not the list wrapper
synchronized (this) {
    for (String s : list) { ... } // not safe
}

// CORRECT
synchronized (list) {
    for (String s : list) { ... }
}
```

### 2. Returning an Unsynchronized View

```java
public List<String> getItems() {
    return items; // exposes the unsynchronized internal list
}
```

Either return an unmodifiable view or a defensive copy:

```java
public List<String> getItems() {
    synchronized (lock) {
        return new ArrayList<>(items); // safe snapshot
    }
}
```

### 3. Double-Checked Locking Without volatile

```java
// BROKEN — visibility issue even with synchronization on check
private static Map<String, Object> cache;

public static Map<String, Object> getCache() {
    if (cache == null) {
        synchronized (MyClass.class) {
            if (cache == null) {
                cache = new HashMap<>(); // NOT safe without volatile
            }
        }
    }
    return cache;
}
```

Fix: declare `cache` as `volatile`, or use `ConcurrentHashMap` initialized eagerly.

---

## Choosing the Right Approach

| Scenario | Recommendation |
| --- | --- |
| Single-threaded code | No synchronization needed |
| Rare concurrent access to existing collection | `Collections.synchronizedXxx` |
| High-throughput concurrent map | `ConcurrentHashMap` |
| Read-heavy list | `CopyOnWriteArrayList` |
| Producer-consumer queue | `LinkedBlockingQueue` or `ArrayBlockingQueue` |
| Read-heavy with occasional writes | `ReadWriteLock` |
| Sorted concurrent map | `ConcurrentSkipListMap` |

---

## Key Takeaways

- Standard `java.util` collections are not thread-safe — always identify sharing before using them concurrently
- `Collections.synchronizedXxx` wraps with one coarse lock — safe for single operations, not for compound ones or iteration
- Compound operations (check-then-act) always require explicit external synchronization
- `ConcurrentHashMap` and other `java.util.concurrent` classes are the right choice for concurrent code
- `ReadWriteLock` is an effective pattern for read-heavy, write-rare data

---

## Navigation

**← Previous:** [Fail-Fast vs Fail-Safe Iterators](/java/failfast-vs-failsafe)

**Next →** [Immutable Collections](/java/immutable-collections)
