---
layout: ../../layouts/BlogLayout.astro
title: TreeSet in Java – Complete Guide
tag: Java Collections Framework
description: Learn Java TreeSet — sorted ordering, NavigableSet methods, red-black tree internals, Comparable vs Comparator, null handling, and practical use cases.
---

`TreeSet` is a `Set` implementation that stores elements in **sorted order** using a red-black tree. It implements the `NavigableSet` interface, which adds powerful range and boundary methods beyond the basic `Set` contract. Operations cost O(log n) instead of O(1), but you get sorted iteration and range queries for free.

---

## How It Works Internally

`TreeSet` is backed by a `TreeMap`. Each element is stored as a key in the `TreeMap` with a constant dummy value. The `TreeMap` uses a **self-balancing red-black tree** to keep keys in sorted order at all times.

After insertions, the tree rebalances to keep all paths from root to leaf within a factor of 2 in length — ensuring O(log n) guaranteed (not just amortized) for add, remove, and contains.

---

## Creating a TreeSet

```java
import java.util.TreeSet;
import java.util.NavigableSet;

// Natural order (elements must implement Comparable)
NavigableSet<String> set = new TreeSet<>();

// Custom Comparator — sort case-insensitively
NavigableSet<String> ciSet = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);

// Reverse order
NavigableSet<Integer> rev = new TreeSet<>(Comparator.reverseOrder());

// From a collection — automatically sorted
TreeSet<Integer> nums = new TreeSet<>(List.of(5, 2, 8, 1, 9, 3));
System.out.println(nums); // [1, 2, 3, 5, 8, 9]
```

---

## Basic Operations

```java
NavigableSet<Integer> set = new TreeSet<>(List.of(10, 5, 20, 15, 25));

set.add(12);     // tree rebalances to keep sorted order
set.remove(20);
set.contains(15); // true

System.out.println(set); // [5, 10, 12, 15, 25]
System.out.println(set.size()); // 5
```

---

## NavigableSet Methods

`TreeSet` implements `NavigableSet`, which adds powerful boundary and range methods:

### Boundary Methods

```java
NavigableSet<Integer> set = new TreeSet<>(List.of(1, 3, 5, 7, 9));

set.first();    // 1 — smallest element
set.last();     // 9 — largest element

set.floor(6);   // 5 — greatest element ≤ 6
set.ceiling(6); // 7 — smallest element ≥ 6
set.lower(5);   // 3 — greatest element strictly < 5
set.higher(5);  // 7 — smallest element strictly > 5

set.pollFirst(); // removes and returns 1
set.pollLast();  // removes and returns 9
```

### Range Views (Subsets)

```java
NavigableSet<Integer> set = new TreeSet<>(List.of(1, 3, 5, 7, 9, 11, 13));

// headSet — elements < 7 (exclusive by default)
set.headSet(7);         // [1, 3, 5]
set.headSet(7, true);   // [1, 3, 5, 7] — inclusive

// tailSet — elements >= 7 (inclusive by default)
set.tailSet(7);         // [7, 9, 11, 13]
set.tailSet(7, false);  // [9, 11, 13] — exclusive

// subSet — elements in range
set.subSet(3, 9);           // [3, 5, 7] — from 3 inclusive to 9 exclusive
set.subSet(3, true, 9, true); // [3, 5, 7, 9] — both inclusive
```

Range views are **live views** — modifications to the subset affect the backing `TreeSet` and vice versa.

### Reverse Order

```java
NavigableSet<Integer> set = new TreeSet<>(List.of(1, 3, 5, 7, 9));
NavigableSet<Integer> desc = set.descendingSet(); // [9, 7, 5, 3, 1]
```

---

## Sorting with Comparator

When elements do not implement `Comparable`, or you want a non-natural order, pass a `Comparator` to the constructor:

```java
public class Employee {
    String name;
    int salary;
    Employee(String name, int salary) { this.name = name; this.salary = salary; }
    @Override public String toString() { return name + "(" + salary + ")"; }
}

// Sort by salary ascending
NavigableSet<Employee> bySalary = new TreeSet<>(
    Comparator.comparingInt(e -> e.salary)
);
bySalary.add(new Employee("Alice", 90000));
bySalary.add(new Employee("Bob", 75000));
bySalary.add(new Employee("Carol", 110000));

System.out.println(bySalary); // [Bob(75000), Alice(90000), Carol(110000)]
```

**Important:** `TreeSet` uses the comparator (or natural ordering) for equality. If the comparator returns 0 for two elements, the second is treated as a duplicate and not inserted — even if `equals()` returns `false`. Your comparator must be consistent with `equals()`.

---

## Null Handling

`TreeSet` does **not** allow null elements. Attempting to add null throws `NullPointerException`:

```java
NavigableSet<String> set = new TreeSet<>();
set.add(null); // NullPointerException
```

This is because the tree must compare the null to existing elements during insertion, and comparison with null always fails.

---

## Time Complexity

| Operation | Time |
| --- | --- |
| `add(E)` | O(log n) |
| `remove(Object)` | O(log n) |
| `contains(Object)` | O(log n) |
| `first()` / `last()` | O(log n) |
| `floor()` / `ceiling()` | O(log n) |
| `headSet()` / `tailSet()` / `subSet()` | O(log n) for view creation |
| Iteration | O(n) |

---

## Real-World Use Cases

### 1. Maintaining a Sorted Scoreboard

```java
TreeSet<Integer> scores = new TreeSet<>(Comparator.reverseOrder());
scores.add(850);
scores.add(920);
scores.add(720);
scores.add(990);

System.out.println("Top 3: " + new ArrayList<>(scores).subList(0, 3));
// [990, 920, 850]
```

### 2. Finding the Closest Match

```java
NavigableSet<Integer> prices = new TreeSet<>(List.of(10, 25, 50, 100, 200));
int budget = 60;

Integer bestAtOrBelow = prices.floor(budget);  // 50
Integer cheapestOver  = prices.ceiling(budget); // 100
```

### 3. Sliding Window Minimum/Maximum

```java
NavigableSet<Integer> window = new TreeSet<>();
int[] arr = {5, 3, 8, 1, 7, 2};
int k = 3;

for (int i = 0; i < arr.length; i++) {
    window.add(arr[i]);
    if (i >= k) window.remove(arr[i - k]);
    if (i >= k - 1) System.out.println("Min: " + window.first());
}
```

---

## Key Takeaways

- `TreeSet` maintains elements in sorted order (natural or custom `Comparator`)
- Backed by a red-black tree — O(log n) for all major operations
- `NavigableSet` methods: `floor`, `ceiling`, `lower`, `higher`, `headSet`, `tailSet`, `subSet`
- Does not allow null elements
- Range views are live — changes propagate to the backing set
- Use when you need sorted iteration or range queries; use `HashSet` when you only need fast membership tests

---

## Navigation

**← Previous:** [LinkedHashSet in Java](/java/linkedhashset-in-java)

**Next →** [The Queue Interface](/java/queue-interface)
