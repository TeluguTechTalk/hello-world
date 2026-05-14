---
layout: ../../layouts/BlogLayout.astro
title: Java try-catch-finally – Complete Guide with Examples
tag: Java Exception Handling
description: Master Java try-catch-finally blocks — syntax, multiple catch, catch ordering rules, multi-catch (Java 7+), and the finally block with all its edge cases explained.
---

The `try-catch-finally` construct is the core of exception handling in Java. This article covers everything: basic syntax, handling multiple exception types, catch ordering, the multi-catch shorthand, and every edge case of the `finally` block.

---

## try-catch — Basic Syntax

Wrap code that might throw in a `try` block. Catch the exception in a `catch` block.

```java
try {
    // code that might throw
} catch (ExceptionType variableName) {
    // code to handle the exception
}
```

When an exception is thrown inside `try`, execution jumps immediately to the matching `catch` block. Code after the throw inside the `try` does **not** run.

### Example

```java
public class DivisionExample {
    public static void main(String[] args) {
        try {
            int result = 10 / 0;
            System.out.println("Result: " + result); // never reached
        } catch (ArithmeticException e) {
            System.out.println("Error: " + e.getMessage());
        }

        System.out.println("Program continues.");
    }
}
```

**Output:**
```
Error: / by zero
Program continues.
```

After the `catch` block completes, execution resumes normally after the entire `try-catch`. The program does **not** go back into the `try` block.

---

## The Exception Object

The variable declared in `catch` (`e` above) is an instance of the exception class. These methods are available on every exception:

| Method | Returns |
| --- | --- |
| `e.getMessage()` | The error message string |
| `e.toString()` | Class name + message |
| `e.printStackTrace()` | Prints full stack trace to stderr |
| `e.getCause()` | The original cause, if this exception wrapped another |
| `e.getClass().getName()` | Fully-qualified exception class name |
| `e.getSuppressed()` | Suppressed exceptions (from try-with-resources) |

---

## Multiple catch Blocks

One `try` block can have multiple `catch` blocks for different exception types.

```java
public class MultiCatch {
    public static void main(String[] args) {
        try {
            String[] names = {"Alice", "Bob"};
            String name = names[5];              // ArrayIndexOutOfBoundsException
            int length = name.length();          // NullPointerException (if null)
            int value  = Integer.parseInt(name); // NumberFormatException
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Array index error: " + e.getMessage());
        } catch (NullPointerException e) {
            System.out.println("Null value encountered");
        } catch (NumberFormatException e) {
            System.out.println("Invalid number format");
        }
    }
}
```

Java evaluates catch blocks top-to-bottom and runs the **first matching one**. Subsequent catch blocks are skipped.

### Catch Ordering Rule — Specific Before General

More specific exception types must come **before** more general ones. The compiler rejects unreachable catch blocks.

```java
// WRONG — does not compile
try { ... }
catch (Exception e)   { ... }  // catches everything
catch (IOException e) { ... }  // unreachable — compiler error

// CORRECT
try { ... }
catch (IOException e)  { ... } // specific first
catch (Exception e)    { ... } // general last (fallback)
```

### Catching a Parent Type

You can catch a parent class to handle all its subtypes in one block:

```java
try {
    riskyDatabaseOperation();
} catch (Exception e) {
    // catches SQLException, RuntimeException, everything — use sparingly
    logger.error("Unexpected error", e);
}
```

---

## Multi-catch (Java 7+)

When two or more exception types need identical handling, use the pipe `|` operator:

```java
try {
    // file or database operation
} catch (IOException | SQLException e) {
    logger.error("Data access error: " + e.getMessage(), e);
    throw new ServiceException("Failed to process request", e);
}
```

Rules for multi-catch:
- The variable `e` is implicitly `final` — you cannot reassign it
- The types cannot be in a parent-child relationship (would be redundant)
- Each type is evaluated independently — any match triggers the block

---

## finally Block

The `finally` block runs **unconditionally** after the `try` block completes, whether or not an exception was thrown or caught.

```java
try {
    // risky code
} catch (ExceptionType e) {
    // handle error
} finally {
    // ALWAYS runs — put cleanup here
}
```

### Example

```java
public class FinallyDemo {
    public static void main(String[] args) {
        try {
            System.out.println("Opening resource...");
            int result = 10 / 0; // throws
            System.out.println("This line never runs");
        } catch (ArithmeticException e) {
            System.out.println("Caught: " + e.getMessage());
        } finally {
            System.out.println("Finally: closing resource.");
        }

        System.out.println("After try-catch-finally.");
    }
}
```

**Output:**
```
Opening resource...
Caught: / by zero
Finally: closing resource.
After try-catch-finally.
```

### finally Without catch

`finally` can be used without a `catch` block:

```java
try {
    openConnection();
    doWork();
} finally {
    closeConnection(); // runs even if doWork() throws
}
```

This pattern is useful when you want the exception to propagate but still need cleanup.

---

## finally — Edge Cases

### When finally Does NOT Run

The only scenarios where `finally` is skipped:

- `System.exit()` is called inside `try` or `catch`
- The JVM crashes (hardware failure, kill signal)

### return Inside finally

Avoid returning inside `finally`. It silently overrides any `return` in the `try` or `catch` block:

```java
public static int compute() {
    try {
        return 1; // would return 1...
    } finally {
        return 2; // ...but this wins — always returns 2
    }
}
```

This is one of Java's most surprising behaviours. The `try` block's `return 1` is discarded.

### Exception Thrown in finally

If `finally` throws an exception, it replaces the original exception from the `try` or `catch` block:

```java
try {
    throw new RuntimeException("original");
} finally {
    throw new RuntimeException("from finally"); // original exception is lost!
}
```

The `"original"` exception is silently discarded. Never throw from `finally`.

> For resource cleanup, use [try-with-resources](/java/try-with-resources) instead — it handles this correctly using suppressed exceptions.

---

## Combining All Three

```java
import java.io.*;

public class FileProcessor {
    public static void process(String path) {
        FileReader reader = null;

        try {
            reader = new FileReader(path);
            BufferedReader br = new BufferedReader(reader);
            System.out.println(br.readLine());

        } catch (FileNotFoundException e) {
            System.out.println("File not found: " + path);

        } catch (IOException e) {
            System.out.println("Read error: " + e.getMessage());

        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    System.err.println("Failed to close reader");
                }
            }
        }
    }
}
```

This manually-managed pattern is verbose. For resource cleanup, prefer [try-with-resources](/java/try-with-resources).

---

## Key Takeaways

- `try` wraps risky code; `catch` handles a specific type; `finally` always runs
- Multiple `catch` blocks are evaluated top-to-bottom — specific before general
- Multi-catch (`|`) handles two or more types with the same code (Java 7+)
- `finally` runs regardless of whether an exception was thrown or caught
- Never `return` or `throw` from inside `finally`
- For cleanup, prefer `try-with-resources` over manual `finally` blocks

---

## Navigation

**← Previous:** [Checked vs Unchecked Exceptions](/java/checked-vs-unchecked-exceptions)

**Next →** [throw vs throws](/java/throw-vs-throws)
