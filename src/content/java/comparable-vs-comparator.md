---
layout: ../../layouts/BlogLayout.astro
title: Comparable vs Comparator in Java
tag: Java Collections Framework
description: Understand Java Comparable and Comparator — natural ordering vs custom ordering, when to use each, multi-field sorting, Java 8 chaining, and interview-level distinctions.
---

Java provides two interfaces for defining element ordering: `Comparable` (built into the object) and `Comparator` (external, pluggable). Knowing when to use each — and how to compose them — is essential for sorting collections correctly.

---

## Comparable — Natural Ordering

`Comparable<T>` is in `java.lang`. When a class implements `Comparable`, it defines its own **natural ordering** by overriding `compareTo()`:

```java
public interface Comparable<T> {
    int compareTo(T other);
}
```

**Return convention:**
- Negative → `this` comes before `other`
- Zero → `this` equals `other` for ordering purposes
- Positive → `this` comes after `other`

```java
public class Employee implements Comparable<Employee> {
    private final String name;
    private final int salary;

    public Employee(String name, int salary) {
        this.name = name;
        this.salary = salary;
    }

    @Override
    public int compareTo(Employee other) {
        return Integer.compare(this.salary, other.salary); // natural order by salary
    }

    @Override
    public String toString() { return name + "(" + salary + ")"; }
}

List<Employee> employees = new ArrayList<>(List.of(
    new Employee("Alice", 90000),
    new Employee("Bob", 75000),
    new Employee("Carol", 110000)
));

Collections.sort(employees); // uses compareTo
System.out.println(employees); // [Bob(75000), Alice(90000), Carol(110000)]
```

---

## Comparator — Custom Ordering

`Comparator<T>` is in `java.util`. It is an **external** ordering strategy — the class being sorted does not need to implement anything:

```java
public interface Comparator<T> {
    int compare(T o1, T o2);
}
```

```java
// Sort by name, external to Employee
Comparator<Employee> byName = (e1, e2) -> e1.name.compareTo(e2.name);
employees.sort(byName);
System.out.println(employees); // [Alice(90000), Bob(75000), Carol(110000)]

// Sort by salary descending
employees.sort(Comparator.comparingInt((Employee e) -> e.salary).reversed());
```

---

## Key Differences

| | `Comparable` | `Comparator` |
| --- | --- | --- |
| Interface package | `java.lang` | `java.util` |
| Method | `compareTo(T other)` | `compare(T o1, T o2)` |
| Implemented by | The class itself | A separate class or lambda |
| Defines | Natural ordering | Custom / alternate ordering |
| Class modification required? | Yes | No |
| Multiple orderings per class | No (one `compareTo`) | Yes (many comparators) |
| Used by | `Collections.sort`, `TreeMap/Set` (default) | `Collections.sort(list, comp)`, `TreeMap/Set(comp)` |

---

## Java 8 Comparator Factory Methods

Java 8 added static factory methods to `Comparator` that eliminate most boilerplate:

```java
// By a single field
Comparator<Employee> bySalary = Comparator.comparingInt(e -> e.salary);

// Reversed
Comparator<Employee> bySalaryDesc = Comparator.comparingInt((Employee e) -> e.salary).reversed();

// Natural order
Comparator<String> natural = Comparator.naturalOrder();

// Reverse natural order
Comparator<String> reverseNatural = Comparator.reverseOrder();

// Null-safe — nulls first
Comparator<String> nullsFirst = Comparator.nullsFirst(Comparator.naturalOrder());

// Null-safe — nulls last
Comparator<String> nullsLast = Comparator.nullsLast(Comparator.naturalOrder());
```

---

## Multi-Field Sorting with thenComparing

Chain comparators with `thenComparing()` for multi-key sort:

```java
Comparator<Employee> multiSort = Comparator
    .comparingInt((Employee e) -> e.salary)         // primary: salary ascending
    .thenComparing(e -> e.name);                    // secondary: name alphabetical

employees.sort(multiSort);

// Sort by department, then salary descending, then name
Comparator<Employee> complex = Comparator
    .comparing((Employee e) -> e.department)
    .thenComparingInt((Employee e) -> e.salary).reversed()
    .thenComparing(e -> e.name);
```

---

## Using With TreeSet and TreeMap

```java
// TreeSet with natural ordering (Employee must implement Comparable)
TreeSet<Employee> byNatural = new TreeSet<>();

// TreeSet with custom Comparator (no Comparable needed)
TreeSet<Employee> byName = new TreeSet<>(Comparator.comparing(e -> e.name));
byName.add(new Employee("Carol", 110000));
byName.add(new Employee("Alice", 90000));
System.out.println(byName); // [Alice(90000), Carol(110000)]

// TreeMap with Comparator on keys
TreeMap<Employee, String> roles = new TreeMap<>(Comparator.comparingInt(e -> e.salary));
```

**Critical:** For `TreeSet` and `TreeMap`, the comparator (or `compareTo`) determines uniqueness. Two elements where `compare(a, b) == 0` are treated as equal — even if `a.equals(b)` is `false`. Make your comparator consistent with `equals()`.

---

## When to Use Each

**Use `Comparable` when:**
- There is one obvious natural order for the class (e.g., `Integer`, `String`, dates by time)
- The ordering is intrinsic to the object's identity
- You control the class source

**Use `Comparator` when:**
- You need multiple different orderings for the same class
- You do not control the class (third-party or JDK types)
- The ordering is contextual (e.g., sort products by price in one view, by name in another)
- You need null-safe or reversed comparisons

---

## Sorting Arrays

Both work with `Arrays.sort()` too:

```java
Employee[] arr = {
    new Employee("Alice", 90000),
    new Employee("Bob", 75000)
};

Arrays.sort(arr);                                     // uses Comparable.compareTo
Arrays.sort(arr, Comparator.comparing(e -> e.name)); // uses Comparator.compare
```

---

## Common Mistakes

**Subtraction-based comparator (integer overflow):**

```java
// WRONG — can overflow for large integers
Comparator<Employee> bad = (e1, e2) -> e1.salary - e2.salary;

// CORRECT
Comparator<Employee> good = Comparator.comparingInt(e -> e.salary);
// or
Comparator<Employee> good2 = (e1, e2) -> Integer.compare(e1.salary, e2.salary);
```

If `e1.salary` is `Integer.MIN_VALUE` and `e2.salary` is positive, subtraction wraps around to a positive number — giving the wrong comparison result.

**Inconsistent with equals in TreeSet:**

```java
// comparator says A == B, but equals says A != B
TreeSet<String> set = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
set.add("Hello");
set.add("hello"); // not added — case-insensitive comparator returns 0
System.out.println(set.size()); // 1
// but "Hello".equals("hello") is false
```

This is correct behaviour for `TreeSet`, but can surprise you if you expected both to be stored.

---

## Key Takeaways

- `Comparable` defines natural ordering within the class itself via `compareTo()`
- `Comparator` defines external, pluggable ordering via `compare()`
- Java 8: use `Comparator.comparing()`, `thenComparing()`, `reversed()`, `nullsFirst()` for clean compositions
- Never use subtraction in a comparator — use `Integer.compare()` or factory methods
- For `TreeSet`/`TreeMap`: the comparator determines equality, not `equals()`

---

## Navigation

**← Previous:** [Hashtable in Java](/java/hashtable-in-java)

**Next →** [Iterator vs ListIterator](/java/iterator-vs-listiterator)
