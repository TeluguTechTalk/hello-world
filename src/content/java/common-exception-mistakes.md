---
layout: ../../layouts/BlogLayout.astro
title: Common Java Exception Handling Mistakes to Avoid
tag: Java Exception Handling
description: Six common Java exception handling anti-patterns — swallowing exceptions, losing the cause, returning from finally, catching Throwable, and more — with fixes for each.
---

Even experienced Java developers repeat the same exception-handling mistakes. This article shows the most common anti-patterns, explains exactly why they are dangerous, and shows the correct approach for each.

---

## Mistake 1 — Catching `Exception` or `Throwable` Too Broadly

Catching `Throwable` or bare `Exception` swallows `OutOfMemoryError`, `StackOverflowError`, and every unchecked bug in your code without distinction. The program continues in an unknown state.

```java
// Dangerous — catches everything, including JVM errors
try {
    doSomething();
} catch (Throwable t) {
    // silently ignored
}
```

The `doSomething()` call might have thrown an `OutOfMemoryError`. Your code continues as if nothing happened, likely corrupting state further.

**Fix:** Catch only the specific exception types you know how to handle. A broad handler at the top level of a web request or background thread is acceptable — but it must log the error and let the infrastructure clean up.

```java
// Acceptable only at the very top level
catch (Exception e) {
    logger.error("Unhandled exception in request processing", e);
    response.sendError(500, "Internal server error");
}
```

---

## Mistake 2 — Losing the Original Exception Cause

When wrapping an exception, forgetting to pass the original as the `cause` discards all diagnostic information.

```java
// Bad — original SQLException is gone
catch (SQLException e) {
    throw new RuntimeException("Database error");
}

// Good — original exception is preserved in the cause chain
catch (SQLException e) {
    throw new DataAccessException("Database error", e);
}
```

In production, you often only see the high-level exception in logs. Without the `Caused by` chain, you have no idea what the actual SQL error was, on which table, or at which line in the driver.

---

## Mistake 3 — Using `return` Inside `finally`

Any `return` statement inside a `finally` block overrides the `return` from the `try` or `catch` block. This produces silent, hard-to-diagnose bugs.

```java
// Bug — always returns false, even when the save succeeds
public boolean saveRecord(Record r) {
    try {
        database.save(r);
        return true;         // would return true...
    } finally {
        return false;        // ...but this always wins
    }
}
```

Every caller of `saveRecord` will always receive `false`. The successful save is invisible.

**Fix:** Never put `return`, `throw`, `break`, or `continue` inside `finally`. Use `finally` only for cleanup (close, release, reset).

---

## Mistake 4 — Throwing from `finally`

If `finally` throws an exception, it replaces the original exception from `try` or `catch`. The original error is permanently lost.

```java
try {
    throw new IOException("original error");
} finally {
    throw new RuntimeException("cleanup failed"); // original IOException is gone!
}
// Only "cleanup failed" propagates — "original error" is silently discarded
```

**Fix:** Wrap cleanup in its own try-catch:

```java
try {
    throw new IOException("original error");
} finally {
    try {
        connection.close();
    } catch (Exception e) {
        logger.warn("Failed to close connection", e);
        // do not re-throw — log and continue so original exception propagates
    }
}
```

Better yet, use [try-with-resources](/java/try-with-resources), which handles this automatically via suppressed exceptions.

---

## Mistake 5 — Declaring Overly Broad `throws`

Declaring `throws Exception` on a method signature tells callers nothing useful and forces them to catch or declare `Exception` everywhere.

```java
// Bad — callers must catch Exception, which means catching everything
public void processOrder(Order order) throws Exception {
    // ...
}

// Good — callers know exactly what to expect
public void processOrder(Order order)
        throws InsufficientInventoryException, PaymentDeclinedException {
    // ...
}
```

Broad `throws Exception` is often a shortcut that avoids thinking about what failures are actually possible. It propagates that vagueness to every caller.

---

## Mistake 6 — NullPointerException From Unchecked Method Chains

Chaining method calls on a value that might be `null` is one of the most common causes of `NullPointerException` in production.

```java
// Bug — NPE if "user.email" key is absent (returns null)
String domain = request.getHeader("User-Agent")
                       .toLowerCase()      // NPE if header absent
                       .split("/")[0];

// Also common
String city = user.getAddress().getCity().toUpperCase(); // NPE if any step is null
```

**Fix:** Check for null explicitly, or use `Optional`:

```java
String ua = request.getHeader("User-Agent");
String domain = (ua != null) ? ua.toLowerCase().split("/")[0] : "unknown";

// Or with Optional
String city = Optional.ofNullable(user)
    .map(User::getAddress)
    .map(Address::getCity)
    .map(String::toUpperCase)
    .orElse("Unknown");
```

---

## Quick Reference

| Mistake | Risk | Fix |
| --- | --- | --- |
| Catching `Throwable` or `Exception` broadly | Hides bugs, continues in corrupt state | Catch only types you can handle |
| Losing the original cause | No root-cause info in logs | Always pass `e` to the new exception constructor |
| `return` in `finally` | Return value silently overridden | Never put flow control in `finally` |
| `throw` in `finally` | Original exception discarded | Wrap cleanup in its own try-catch; use try-with-resources |
| `throws Exception` in signatures | Callers cannot differentiate errors | Declare specific checked exception types |
| Unchecked null chains | `NullPointerException` in production | Null-check, guard with `Optional`, or use `Objects.requireNonNull` |

---

## Navigation

**← Previous:** [Exception Best Practices](/java/exception-best-practices)

**Next →** [Real-World Exception Handling Examples](/java/real-world-exception-handling-examples)
