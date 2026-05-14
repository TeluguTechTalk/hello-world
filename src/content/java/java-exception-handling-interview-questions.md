---
layout: ../../layouts/BlogLayout.astro
title: Java Exception Handling Interview Questions and Answers
tag: Java Exception Handling
description: Top 10 Java exception handling interview questions with detailed answers — covering checked vs unchecked, try-with-resources, suppressed exceptions, finally, throw vs throws, and more.
---

These are the most commonly asked Java exception handling interview questions — from entry level to senior engineer. Each answer is concise enough to deliver in an interview but complete enough to demonstrate real understanding.

---

## Q1 — What is the difference between `Error` and `Exception`?

Both extend `java.lang.Throwable`.

`Error` represents serious JVM-level failures — `OutOfMemoryError`, `StackOverflowError` — that are generally unrecoverable. You should not catch `Error`; the JVM is in an unstable state and there is nothing your application can meaningfully do.

`Exception` represents failures that an application can anticipate and handle. `RuntimeException` and its subclasses are **unchecked** (no compiler enforcement). All other `Exception` subclasses are **checked** (the compiler requires handling or declaration).

---

## Q2 — What is the difference between checked and unchecked exceptions?

**Checked exceptions** extend `Exception` but not `RuntimeException`. The compiler enforces that they are either caught with `try-catch` or declared with `throws`. They represent recoverable external conditions: `IOException`, `SQLException`, `ParseException`.

**Unchecked exceptions** extend `RuntimeException`. The compiler does not require handling. They represent programming bugs: `NullPointerException`, `IllegalArgumentException`, `ArrayIndexOutOfBoundsException`.

Use checked exceptions when the caller can reasonably recover. Use unchecked when the failure is a violated contract or programming error that the caller cannot fix at the call site.

---

## Q3 — Can the `finally` block be skipped?

In two scenarios:

1. `System.exit()` is called inside `try` or `catch` — the JVM shuts down immediately
2. The JVM crashes (hardware failure, kill signal, `Runtime.halt()`)

In all other cases — including uncaught exceptions, `return` statements, and `break`/`continue` — `finally` always executes.

---

## Q4 — What is exception chaining?

Exception chaining (also called exception wrapping) is the practice of catching one exception and throwing another while passing the original as the **cause**:

```java
catch (SQLException e) {
    throw new DataAccessException("Failed to load user", e); // e is the cause
}
```

This preserves the full diagnostic context. You can inspect the chain with `getCause()` and it appears as `Caused by:` in the stack trace. Without chaining, the root cause is permanently lost.

---

## Q5 — What is the difference between `throw` and `throws`?

| | `throw` | `throws` |
| --- | --- | --- |
| Location | Inside method body | Method signature |
| Effect | Raises an exception immediately | Declares a possible checked exception |
| Syntax | `throw new IOException("msg")` | `void read() throws IOException` |

`throw` is an action. `throws` is a declaration. You use both together: `throws` warns callers, `throw` fires the exception.

---

## Q6 — What is try-with-resources and how does it differ from `finally`?

`try-with-resources` (Java 7+) automatically calls `close()` on resources that implement `AutoCloseable` when the block exits — whether normally, via exception, or via `return`.

The critical difference is **suppressed exceptions**. If both the `try` body and `close()` throw, `finally` discards the original exception. try-with-resources attaches the `close()` exception as a **suppressed exception** accessible via `e.getSuppressed()`, so neither exception is lost.

```java
// try-with-resources — both exceptions preserved
try (MyResource r = new MyResource()) {
    r.use(); // throws "primary"
}
// r.close() throws "close error" → attached as suppressed, not discarded
```

---

## Q7 — Can you catch multiple exceptions in a single catch block?

Yes. Java 7 introduced multi-catch with the `|` operator:

```java
catch (IOException | SQLException e) {
    logger.error("Data access failure", e);
}
```

The variable `e` is implicitly `final`. The types must not be in a parent-child relationship. Multi-catch reduces duplication when two different exception types need identical handling.

---

## Q8 — What happens if an exception is thrown inside a `catch` block?

It propagates up the call stack normally — exactly as if it had been thrown outside any try-catch. The original exception being handled is abandoned (unless you chain the new exception with the original as its cause):

```java
catch (IOException e) {
    throw new ServiceException("Failed", e); // chains original
}
```

Without chaining, the original `IOException` is gone once `ServiceException` is thrown.

---

## Q9 — Is it good practice to catch `Exception` as a blanket catch-all?

Generally no. Catching `Exception` broadly:
- Catches `NullPointerException`, `IllegalArgumentException`, and other bugs that should propagate
- Makes it impossible for callers to distinguish failure modes
- Hides programming errors that should be fixed, not swallowed

Acceptable places for `catch (Exception e)`:
- A global HTTP exception handler (map to 500 response)
- A background thread's run loop (log and continue rather than crash the thread)
- A top-level `main` method exit guard

In all these cases, the handler should log the full exception and not silently discard it.

---

## Q10 — What are suppressed exceptions?

When try-with-resources closes a resource, if both the `try` body and the `close()` method throw, the `close()` exception is attached to the primary exception as a **suppressed exception** rather than replacing it.

```java
try (BrokenResource r = new BrokenResource()) {
    throw new RuntimeException("primary");
    // r.close() also throws
} catch (RuntimeException e) {
    System.out.println("Primary: " + e.getMessage());
    for (Throwable s : e.getSuppressed()) {
        System.out.println("Suppressed: " + s.getMessage());
    }
}
```

**Output:**
```
Primary: primary
Suppressed: close failed
```

Suppressed exceptions were introduced in Java 7 specifically to support try-with-resources. They ensure no exception information is silently discarded.

---

## Full Series Summary

| Concept | Key Point |
| --- | --- |
| Exception hierarchy | `Throwable` → `Error` / `Exception` → `RuntimeException` |
| Checked exceptions | Compiler-enforced; extend `Exception` (not `RuntimeException`) |
| Unchecked exceptions | Not enforced; extend `RuntimeException`; signal bugs |
| `try-catch` | Wrap risky code; catch specific types; specific before general |
| `finally` | Always runs; never return/throw from it |
| `throw` | Raises an exception instance from method code |
| `throws` | Declares checked exceptions in a method signature |
| Custom exceptions | Extend `Exception` or `RuntimeException`; always include cause constructor |
| try-with-resources | Auto-closes `AutoCloseable`; suppressed exceptions preserve both errors |
| Exception propagation | Bubbles up call stack until caught; chain when wrapping |
| Best practices | Specific catch, no swallowing, log full exception, custom types, fail fast |

---

## Continue Learning

- [Exception Best Practices](/java/exception-best-practices) — production-grade patterns
- [Real-World Examples](/java/real-world-exception-handling-examples) — complete code walkthroughs
- [Exception Handling Overview](/java/exception-handling-overview) — full series index

---

## Navigation

**← Previous:** [Real-World Exception Handling Examples](/java/real-world-exception-handling-examples)

**← Back to Series:** [Exception Handling Overview](/java/exception-handling-overview)
