---
layout: ../../layouts/BlogLayout.astro
title: The List Interface in Java
tag: Java Collections Framework
description: Understand the Java List interface — what it guarantees, its key methods, how it compares to Set, and how to choose between ArrayList, LinkedList, and Vector.
---

`List` is the most widely used interface in the Java Collections Framework. It represents an **ordered, indexed collection** that allows duplicate elements. Every Java developer uses `List` daily — understanding what it guarantees (and what it doesn't) is foundational.

---

## What List Guarantees

1. **Order is preserved** — elements remain in the order they were inserted
2. **Index-based access** — every element can be accessed by a zero-based integer index
3. **Duplicates allowed** — the same object can appear multiple times
4. **Null elements allowed** — unless the specific implementation forbids them

---

## Core Methods

### Adding Elements

```java
List<String> list = new ArrayList<>();

list.add("Alice");           // append to end
list.add(0, "Bob");          // insert at index 0
list.addAll(otherList);      // append all from another collection
list.addAll(1, otherList);   // insert all starting at index 1
```

### Accessing Elements

```java
String first = list.get(0);           // by index
int idx = list.indexOf("Alice");      // first occurrence (-1 if not found)
int last = list.lastIndexOf("Alice"); // last occurrence
List<String> sub = list.subList(1, 3); // view from index 1 (inclusive) to 3 (exclusive)
```

### Removing Elements

```java
list.remove(0);          // remove by index
list.remove("Alice");    // remove first occurrence by value
list.removeAll(other);   // remove all elements in other
list.retainAll(other);   // keep only elements also in other
list.clear();            // remove everything
```

### Checking State

```java
int size = list.size();
boolean empty = list.isEmpty();
boolean has = list.contains("Alice");
boolean hasAll = list.containsAll(other);
```

### Replacing and Sorting

```java
list.set(0, "Carol");                         // replace element at index
Collections.sort(list);                       // sort using natural order
list.sort(Comparator.reverseOrder());         // sort with custom Comparator
list.replaceAll(String::toUpperCase);         // replace each element (Java 8)
```

### Converting to Array

```java
Object[] arr = list.toArray();
String[] strArr = list.toArray(new String[0]);
```

---

## Iterating a List

```java
List<String> names = List.of("Alice", "Bob", "Charlie");

// 1. Enhanced for loop (most common)
for (String name : names) {
    System.out.println(name);
}

// 2. Index-based loop (when you need the index)
for (int i = 0; i < names.size(); i++) {
    System.out.println(i + ": " + names.get(i));
}

// 3. Iterator (safe removal during iteration)
Iterator<String> it = names.iterator();
while (it.hasNext()) {
    if (it.next().startsWith("A")) {
        it.remove(); // safe removal
    }
}

// 4. forEach with lambda (Java 8)
names.forEach(System.out::println);

// 5. Stream (Java 8, for functional pipelines)
names.stream()
     .filter(n -> n.length() > 3)
     .forEach(System.out::println);
```

---

## Choosing a List Implementation

| Criteria | Use |
| --- | --- |
| General-purpose, mostly reads | `ArrayList` |
| Frequent insert/delete at head or middle | `LinkedList` |
| Legacy synchronized code | `Vector` |
| Need LIFO with a List | `LinkedList` (or use `ArrayDeque`) |
| Read-only after construction | `List.of(...)` (Java 9+) |

In practice, **`ArrayList` is the right default** for the vast majority of use cases. Reach for `LinkedList` only after measuring that random-access inserts are a real bottleneck.

---

## List vs Set vs Map

| | List | Set | Map |
| --- | --- | --- | --- |
| Duplicates | Allowed | Not allowed | Keys: no; values: yes |
| Order | Yes (by index) | Depends | Depends |
| Access | By index or value | By value only | By key |
| Typical use | Sequences, ordered data | Unique elements, membership tests | Lookup tables |

---

## Common Mistakes

**Modifying a list while iterating with enhanced for:**

```java
List<String> names = new ArrayList<>(List.of("Alice", "Bob"));
for (String name : names) {
    if (name.equals("Alice")) {
        names.remove(name); // throws ConcurrentModificationException
    }
}
```

Fix: use `Iterator.remove()` or `removeIf()`:

```java
names.removeIf(name -> name.equals("Alice")); // clean and safe
```

**Using `remove(int)` vs `remove(Object)` with Integer lists:**

```java
List<Integer> nums = new ArrayList<>(List.of(1, 2, 3));
nums.remove(1);          // removes element at INDEX 1 → list is [1, 3]
nums.remove(Integer.valueOf(1)); // removes VALUE 1 → list is [2, 3]
```

Always be explicit with `Integer` lists.

---

## Key Takeaways

- `List` guarantees insertion order, indexed access, and allows duplicates
- Core methods: add, get, remove, set, size, contains, sort, subList
- `ArrayList` is the go-to implementation for most use cases
- Use `removeIf()` or `Iterator.remove()` for safe removal during traversal
- With `Integer` lists, be explicit about whether you are removing by index or value

---

## Navigation

**← Previous:** [What is the Collections Framework?](/java/what-is-collections-framework)

**Next →** [ArrayList in Java](/java/arraylist-in-java)
