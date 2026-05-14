---
layout: ../../layouts/BlogLayout.astro
title: Checked vs Unchecked Exceptions in Java
tag: Java Exception Handling
description: Understand the difference between checked and unchecked exceptions in Java — when to use each, how the compiler enforces them, and which common exceptions fall into each category.
---

Java divides exceptions into two categories: **checked** and **unchecked**. This distinction affects how you write method signatures, how the compiler validates your code, and how exception handling is designed in larger systems.

---

## The Core Difference

| | Checked | Unchecked |
| --- | --- | --- |
| Extends | `Exception` (not `RuntimeException`) | `RuntimeException` |
| Compiler enforces handling? | Yes | No |
| Represents | Recoverable external conditions | Programming bugs or violations |
| When to use | Failures the caller can reasonably respond to | Logic errors, invalid state, violated contracts |
| Examples | `IOException`, `SQLException`, `ParseException` | `NullPointerException`, `IllegalArgumentException` |

---

## Checked Exceptions

The compiler **requires** you to either catch a checked exception or declare that your method throws it. If you do neither, your code will not compile.

Checked exceptions represent conditions outside your application's control — file system state, database availability, network access — where the caller genuinely has recovery options.

```java
import java.io.*;

public class FileReader {
    public static void main(String[] args) {
        // This does NOT compile — IOException is unhandled
        FileInputStream file = new FileInputStream("data.txt");
    }
}
```

**Compiler error:**
```
error: unreported exception FileNotFoundException; must be caught or declared to be thrown
```

You have two choices:

### Option 1 — Handle it with try-catch

```java
public static void readFile() {
    try {
        FileInputStream file = new FileInputStream("data.txt");
        // use file...
    } catch (FileNotFoundException e) {
        System.out.println("File not found: " + e.getMessage());
        // load defaults, log, retry, etc.
    }
}
```

### Option 2 — Declare it with throws

```java
public static void readFile() throws FileNotFoundException {
    FileInputStream file = new FileInputStream("data.txt");
    // caller is now responsible for handling FileNotFoundException
}
```

### Common Checked Exceptions

| Exception | Thrown When |
| --- | --- |
| `IOException` | General I/O failure |
| `FileNotFoundException` | File path does not exist |
| `SQLException` | Database operation fails |
| `ClassNotFoundException` | Class cannot be found at runtime |
| `ParseException` | String cannot be parsed (e.g., date formats) |
| `InterruptedException` | Thread interrupted while waiting or sleeping |

---

## Unchecked Exceptions

Unchecked exceptions extend `RuntimeException`. The compiler does not require you to handle or declare them — they can propagate silently up the call stack.

They signal **programming bugs**: accessing a null reference, going out of array bounds, passing an invalid argument. The correct fix is to write code that prevents these conditions, not to add catch blocks around them.

```java
public class Main {
    public static void main(String[] args) {
        String name = null;
        System.out.println(name.length()); // NullPointerException at runtime
    }
}
```

**Output:**
```
Exception in thread "main" java.lang.NullPointerException
    at Main.main(Main.java:4)
```

The compiler accepts this code. The crash happens at runtime.

### Common Unchecked Exceptions

| Exception | Common Cause |
| --- | --- |
| `NullPointerException` | Calling a method on a `null` reference |
| `ArrayIndexOutOfBoundsException` | Accessing an invalid array index |
| `ArithmeticException` | Integer division by zero |
| `ClassCastException` | Casting to an incompatible type |
| `NumberFormatException` | `Integer.parseInt("abc")` |
| `IllegalArgumentException` | Invalid argument passed to a method |
| `IllegalStateException` | Object in wrong state for the operation |
| `StackOverflowError` | Infinite recursion |

---

## When to Use Each

### Use Checked Exceptions When

- The failure is caused by an **external condition** (file system, network, database)
- The caller has a **reasonable recovery path** — try a fallback, prompt the user, retry
- The exception is a **normal part of the API contract** (e.g., `FileNotFoundException` on file open)

```java
// Good use of checked exception — caller can retry or use a default
public String readConfig(String path) throws IOException {
    return Files.readString(Paths.get(path));
}
```

### Use Unchecked Exceptions When

- The failure is caused by a **programming error** (invalid argument, null where not expected)
- **No caller can meaningfully recover** at the point of the call
- The condition represents a **violated contract** (precondition failure)

```java
// Good use of unchecked exception — caller passed invalid data
public void setAge(int age) {
    if (age < 0 || age > 150) {
        throw new IllegalArgumentException("Invalid age: " + age);
    }
    this.age = age;
}
```

### The Debate

There is ongoing debate in the Java community about checked exceptions. Many modern frameworks (Spring, Hibernate) wrap checked exceptions in unchecked ones to avoid forcing callers to handle low-level failures. The practical rule: use checked exceptions for failures where **the immediate caller** can and should do something different. Use unchecked when the failure is either a bug or something no reasonable caller can fix.

---

## Checked Exception — Full Example

```java
import java.io.*;
import java.util.Properties;

public class ConfigLoader {

    // Declares IOException — caller decides how to handle it
    public static Properties load(String path) throws IOException {
        Properties props = new Properties();
        try (InputStream in = new FileInputStream(path)) {
            props.load(in);
        }
        return props;
    }

    public static void main(String[] args) {
        try {
            Properties config = load("app.properties");
            System.out.println("Loaded: " + config.getProperty("app.name"));
        } catch (FileNotFoundException e) {
            System.out.println("Config file missing — using defaults");
        } catch (IOException e) {
            System.out.println("Failed to read config: " + e.getMessage());
        }
    }
}
```

---

## Unchecked Exception — Full Example

```java
public class UserService {

    public User findById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("User ID must be a positive number, got: " + id);
        }
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("No user with id " + id));
    }
}
```

`IllegalArgumentException` and `UserNotFoundException` (extending `RuntimeException`) signal that the caller passed invalid data. No `throws` declaration needed.

---

## Key Takeaways

- Checked exceptions are enforced by the compiler — handle or declare
- Unchecked exceptions are `RuntimeException` subclasses — not compiler-enforced
- Checked = recoverable external conditions; unchecked = programming errors
- Both types should carry clear, informative messages
- Modern frameworks often prefer unchecked exceptions to avoid cluttering APIs

---

## Navigation

**← Previous:** [The Throwable Hierarchy](/java/throwable-hierarchy)

**Next →** [try-catch and finally](/java/try-catch-finally)
