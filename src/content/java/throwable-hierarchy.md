---
layout: ../../layouts/BlogLayout.astro
title: Java Throwable Hierarchy – Error vs Exception Explained
tag: Java Exception Handling
description: Understand the complete Java Throwable class hierarchy — the difference between Error and Exception, checked and unchecked branches, and what you should and should not catch.
---

Every exception in Java is an object. All of them ultimately inherit from a single class: `java.lang.Throwable`. Understanding this hierarchy tells you what is safe to catch, what to avoid, and how the Java exception system is designed.

---

## The Full Hierarchy

```
java.lang.Object
    └── java.lang.Throwable
            ├── java.lang.Error
            │       ├── OutOfMemoryError
            │       ├── StackOverflowError
            │       ├── AssertionError
            │       └── VirtualMachineError
            └── java.lang.Exception
                    ├── IOException
                    │       └── FileNotFoundException
                    ├── SQLException
                    ├── ClassNotFoundException
                    ├── ParseException
                    └── RuntimeException  ← unchecked branch
                            ├── NullPointerException
                            ├── ArrayIndexOutOfBoundsException
                            ├── ArithmeticException
                            ├── ClassCastException
                            ├── NumberFormatException
                            ├── IllegalArgumentException
                            └── IllegalStateException
```

There are two main branches under `Throwable`:

- **`Error`** — serious JVM-level problems
- **`Exception`** — conditions an application might handle

Under `Exception`, there is a further split:

- **`RuntimeException`** and its subclasses — **unchecked** (compiler does not require handling)
- Everything else under `Exception` — **checked** (compiler requires handling or declaration)

---

## Error vs Exception

| | `Error` | `Exception` |
| --- | --- | --- |
| Caused by | JVM or system-level failure | Application-level failure |
| Recoverable? | Almost never | Usually yes |
| Should you catch it? | No (in general) | Yes |
| Compiler enforces handling? | No | Only for checked exceptions |
| Examples | `OutOfMemoryError`, `StackOverflowError` | `IOException`, `NullPointerException` |

### Errors

`Error` signals that the JVM itself is in trouble — the heap is full, the call stack has overflowed, or the virtual machine is corrupted. These are not bugs in your code that you can recover from by catching them.

```java
// DO NOT do this
try {
    riskyOperation();
} catch (OutOfMemoryError e) {
    // You likely cannot recover — the heap is gone
}
```

The only reasonable use of catching an `Error` is a top-level logger that attempts to record the failure before the process exits. In all other cases, let it propagate.

### Exceptions

`Exception` represents conditions that your application can anticipate and respond to. A file might not exist. A network request might time out. A user might provide invalid input. These are expected failure modes.

```java
try {
    FileInputStream file = new FileInputStream("config.txt");
} catch (FileNotFoundException e) {
    System.out.println("Config not found, using defaults.");
    loadDefaults();
}
```

---

## RuntimeException — The Unchecked Branch

`RuntimeException` and all its subclasses are called **unchecked** exceptions. The compiler does not require you to handle or declare them.

They typically indicate **programming mistakes** rather than external conditions:

| Exception | What it indicates |
| --- | --- |
| `NullPointerException` | Accessed a member on a `null` reference |
| `ArrayIndexOutOfBoundsException` | Accessed an index outside the array |
| `ClassCastException` | Cast an object to an incompatible type |
| `IllegalArgumentException` | A method received an invalid argument |
| `IllegalStateException` | Object is in an invalid state for the operation |
| `ArithmeticException` | Integer division by zero |
| `NumberFormatException` | Could not parse a string as a number |

These should be fixed in the code, not silently caught. If you are getting a `NullPointerException`, the fix is to not pass null — not to wrap everything in a try-catch.

---

## Checked Exceptions

All `Exception` subclasses that do **not** extend `RuntimeException` are **checked**. The compiler enforces that you either catch them or declare them with `throws`.

```java
// This will not compile — IOException is checked
public void readFile() {
    new FileInputStream("data.txt"); // Unhandled IOException
}

// Correct — either handle it
public void readFile() {
    try {
        new FileInputStream("data.txt");
    } catch (FileNotFoundException e) {
        System.out.println("File missing: " + e.getMessage());
    }
}

// Or declare it
public void readFile() throws IOException {
    new FileInputStream("data.txt");
}
```

Checked exceptions represent **recoverable external conditions** — file system state, database availability, network access — things your code cannot fully control.

---

## Practical Rules

1. **Never catch `Error`** — you cannot fix an out-of-memory or stack overflow from within the JVM
2. **Catch specific exception types** — avoid catching `Exception` broadly unless at a top-level handler
3. **Unchecked exceptions signal bugs** — fix the cause, don't just catch it
4. **Checked exceptions signal recoverable conditions** — handle them or propagate deliberately

---

## Key Takeaways

- `Throwable` is the root of all exceptions and errors in Java
- `Error` = JVM failure, do not catch; `Exception` = application failure, handle appropriately
- Checked exceptions (`IOException`, `SQLException`) must be handled or declared
- Unchecked exceptions (`RuntimeException` subclasses) indicate programming errors
- The compiler only enforces handling for checked exceptions

---

## Navigation

**← Previous:** [What is Exception Handling?](/java/what-is-exception-handling)

**Next →** [Checked vs Unchecked Exceptions](/java/checked-vs-unchecked-exceptions)
