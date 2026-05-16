---
layout: ../../layouts/BlogLayout.astro
title: The Set Interface in Java
tag: Java Collections Framework
description: Understand the Java Set interface — no-duplicate contract, key methods, ordering behavior across implementations, and how to choose between HashSet, LinkedHashSet, and TreeSet.
---

`Set` is a collection that **contains no duplicate elements**. It models the mathematical concept of a set. Unlike `List`, there is no guaranteed order (unless you pick an implementation that provides it) and no index-based access.

---

## What Set Guarantees

1. **No duplicates** — adding an element that is already present has no effect
2. **Equality by `equals()` and `hashCode()`** — duplicates are detected using these methods
3. **`add()` returns `false` if the element already exists** — use this to detect duplicates

What `Set` does NOT guarantee:
- Insertion order (use `LinkedHashSet` for that)
- Sorted order (use `TreeSet` for that)
- Index-based access (no `get(int)`)

---

## Core Methods

### Adding and Removing

```java
Set<String> set = new HashSet<>();

boolean added = set.add("Alice");  // true — Alice is new
boolean dup   = set.add("Alice");  // false — Alice already exists
set.add("Bob");
set.add("Carol");

set.remove("Bob");               // removes Bob
set.clear();                     // removes all elements
```

### Querying

```java
Set<String> set = new HashSet<>(Set.of("Alice", "Bob", "Carol"));

set.contains("Alice");  // true
set.contains("Dave");   // false
set.size();             // 3
set.isEmpty();          // false
```

### Set Mathematics

```java
Set<Integer> a = new HashSet<>(Set.of(1, 2, 3, 4));
Set<Integer> b = new HashSet<>(Set.of(3, 4, 5, 6));

// Union
Set<Integer> union = new HashSet<>(a);
union.addAll(b);          // {1, 2, 3, 4, 5, 6}

// Intersection
Set<Integer> intersection = new HashSet<>(a);
intersection.retainAll(b); // {3, 4}

// Difference (a - b)
Set<Integer> diff = new HashSet<>(a);
diff.removeAll(b);         // {1, 2}

// Is subset?
Set<Integer> subset = Set.of(3, 4);
boolean isSub = a.containsAll(subset); // true
```

---

## Iterating a Set

```java
Set<String> set = Set.of("Alice", "Bob", "Carol");

// Enhanced for loop
for (String name : set) {
    System.out.println(name);
}

// Stream
set.stream()
   .filter(n -> n.startsWith("A"))
   .forEach(System.out::println);

// forEach (Java 8)
set.forEach(System.out::println);
```

---

## Choosing a Set Implementation

| | `HashSet` | `LinkedHashSet` | `TreeSet` |
| --- | --- | --- | --- |
| Order | None | Insertion order | Sorted (natural or Comparator) |
| `add` / `contains` / `remove` | O(1) average | O(1) average | O(log n) |
| Null element | 1 allowed | 1 allowed | Not allowed |
| Thread safety | None | None | None |
| Memory | Lower | Higher (linked list overhead) | Higher (tree nodes) |
| Best for | General membership test | Ordered deduplication | Sorted ranges |

**Default choice:** `HashSet` — fastest for pure membership tests.

Use `LinkedHashSet` when you need to preserve insertion order (e.g., deduplicate while keeping order).

Use `TreeSet` when you need sorted iteration or range queries (`headSet`, `tailSet`, `subSet`).

---

## The Duplicate Detection Contract

`Set` uses `equals()` and `hashCode()` to detect duplicates. If you store custom objects, you **must** override both:

```java
public class User {
    private final String email;

    public User(String email) { this.email = email; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User u)) return false;
        return Objects.equals(email, u.email);
    }

    @Override
    public int hashCode() {
        return Objects.hash(email);
    }
}

Set<User> users = new HashSet<>();
users.add(new User("alice@example.com"));
users.add(new User("alice@example.com")); // not added — duplicate

System.out.println(users.size()); // 1
```

If you only override `equals()` without `hashCode()`, two objects that are `equals` can end up in different hash buckets — and `HashSet` will treat them as distinct elements. This is one of the most common bugs with custom objects in sets.

---

## Set vs List

| | `Set` | `List` |
| --- | --- | --- |
| Duplicates | Not allowed | Allowed |
| Order | Depends on impl | Insertion order |
| Index access | No | Yes |
| `contains()` | O(1) (HashSet) | O(n) |
| Typical use | Unique membership | Sequences |

Use `Set` when uniqueness is a requirement. Use `List` when order and duplicates both matter.

---

## Common Mistakes

**Mutating a key object stored in a HashSet:**

```java
Set<List<Integer>> set = new HashSet<>();
List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
set.add(list);

list.add(4); // mutates the list — changes its hashCode
set.contains(list); // may return false — hashCode changed
```

Never store mutable objects as set elements if those objects will be modified after insertion.

**Expecting a specific iteration order from HashSet:**

```java
Set<String> set = new HashSet<>(List.of("C", "A", "B"));
// Output order is UNDEFINED — may be A, C, B or any permutation
for (String s : set) System.out.println(s);
```

If you need consistent output order, use `LinkedHashSet` (insertion order) or `TreeSet` (sorted).

---

## Key Takeaways

- `Set` enforces uniqueness — `add()` returns `false` for duplicates
- No index-based access, no guaranteed order (unless using LinkedHashSet or TreeSet)
- Override both `equals()` and `hashCode()` for custom objects
- `HashSet` for speed, `LinkedHashSet` for insertion order, `TreeSet` for sorted order
- Supports set math: union (`addAll`), intersection (`retainAll`), difference (`removeAll`)

---

## Navigation

**← Previous:** [Stack in Java](/java/stack-in-java)

**Next →** [HashSet in Java](/java/hashset-in-java)
