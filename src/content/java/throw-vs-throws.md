---
layout: ../../layouts/BlogLayout.astro
title: throw vs throws in Java – Key Differences Explained
tag: Java Exception Handling
description: Understand the difference between throw and throws in Java — when to use each, how they work together, and how to declare and propagate exceptions correctly in method signatures.
---

`throw` and `throws` are two of Java's five exception-handling keywords. They look similar and are often confused, but they serve completely different purposes. This article explains both with clear examples.

---

## The One-Line Difference

- **`throw`** — actually throws an exception object from inside method code
- **`throws`** — declares in a method signature that the method might propagate a checked exception

---

## `throw` — Throwing an Exception

Use `throw` inside a method body to explicitly raise an exception. You always follow it with a `new` exception instance.

```java
throw new ExceptionType("message");
```

`throw` immediately stops method execution and propagates the exception up the call stack.

### Example — Validation with throw

```java
public class AgeValidator {

    public static void validateAge(int age) {
        if (age < 0) {
            throw new IllegalArgumentException("Age cannot be negative: " + age);
        }
        if (age > 150) {
            throw new IllegalArgumentException("Age value is unrealistic: " + age);
        }
        System.out.println("Age is valid: " + age);
    }

    public static void main(String[] args) {
        validateAge(25);   // Age is valid: 25
        validateAge(-5);   // throws IllegalArgumentException
    }
}
```

**Output:**
```
Age is valid: 25
Exception in thread "main" java.lang.IllegalArgumentException: Age cannot be negative: -5
    at AgeValidator.validateAge(AgeValidator.java:4)
    at AgeValidator.main(AgeValidator.java:12)
```

### throw with Checked Exceptions

You can also throw checked exceptions manually. The compiler then requires the calling method to handle or declare them:

```java
public void loadConfig(String path) throws IOException {
    if (path == null || path.isBlank()) {
        throw new IOException("Config path must not be empty");
    }
    // proceed to load...
}
```

---

## `throws` — Declaring Exceptions

Use `throws` in the **method signature** to tell callers that this method might throw a checked exception. The caller must then either handle it with `try-catch` or propagate it further with their own `throws` declaration.

```java
public ReturnType methodName(params) throws CheckedException {
    // method body
}
```

### Example — File Reading

```java
import java.io.*;

public class FileProcessor {

    // Declares that this method might throw IOException
    public static String readFirstLine(String path) throws IOException {
        BufferedReader reader = new BufferedReader(new FileReader(path));
        return reader.readLine();
    }

    public static void main(String[] args) {
        // Caller must handle the declared IOException
        try {
            String line = readFirstLine("notes.txt");
            System.out.println("First line: " + line);
        } catch (IOException e) {
            System.out.println("Could not read file: " + e.getMessage());
        }
    }
}
```

### Declaring Multiple Exceptions

A method can declare more than one exception type, separated by commas:

```java
public void process(String path) throws IOException, ParseException {
    // might throw either
}
```

### throws Is Not Required for Unchecked Exceptions

You can declare unchecked exceptions in `throws` for documentation purposes, but it is optional. The compiler does not enforce it:

```java
// Optional — compiler does not require this
public void divide(int a, int b) throws ArithmeticException {
    return a / b;
}
```

---

## Side-by-Side Comparison

| | `throw` | `throws` |
| --- | --- | --- |
| Where used | Inside method body | In method signature |
| Purpose | Actually raises an exception | Declares a possible exception |
| Followed by | An exception instance (`new ...`) | Exception class name(s) |
| Required for | — | Checked exceptions that propagate |
| Syntax | `throw new IOException("msg");` | `void read() throws IOException` |
| Stops execution? | Yes — immediately | No — just a declaration |

---

## How They Work Together

`throw` and `throws` are commonly used together. A method uses `throw` to raise an exception, and `throws` to declare that it might do so:

```java
import java.io.*;

public class DataReader {

    // throws declares the checked exception
    public static String readFile(String path) throws IOException {

        if (path == null) {
            // throw raises it
            throw new IllegalArgumentException("Path must not be null");
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(path))) {
            return reader.readLine();
        }
        // FileNotFoundException (a subtype of IOException) propagates via throws
    }

    public static void main(String[] args) {
        try {
            System.out.println(readFile("data.txt"));
        } catch (IOException e) {
            System.out.println("Failed: " + e.getMessage());
        }
    }
}
```

Note that `IllegalArgumentException` (unchecked) does not need to be declared in `throws`.

---

## Propagating Up the Call Chain

`throws` allows a checked exception to propagate through multiple method levels without being caught at each one:

```java
public void step3() throws IOException {
    throw new IOException("disk full");
}

public void step2() throws IOException {
    step3(); // propagates without catching
}

public void step1() throws IOException {
    step2(); // propagates without catching
}

public static void main(String[] args) {
    try {
        step1(); // caught here, at the top
    } catch (IOException e) {
        System.out.println("Handled at main: " + e.getMessage());
    }
}
```

---

## Key Takeaways

- `throw` raises an exception instance at runtime — it stops execution immediately
- `throws` is a compile-time declaration — it tells callers what might propagate
- Together: `throw` fires the exception; `throws` gives callers advance notice
- Only checked exceptions must be declared with `throws`
- A method can `throw` without `throws` for unchecked exceptions

---

## Navigation

**← Previous:** [try-catch and finally](/java/try-catch-finally)

**Next →** [Custom Exceptions](/java/custom-exceptions)
