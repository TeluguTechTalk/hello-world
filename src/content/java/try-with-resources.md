---
layout: ../../layouts/BlogLayout.astro
title: Java try-with-resources – Automatic Resource Management
tag: Java Exception Handling
description: Learn how try-with-resources in Java 7+ automatically closes files, connections, and streams. Covers AutoCloseable, multiple resources, suppressed exceptions, and custom closeable classes.
---

Before Java 7, closing resources like files and database connections required verbose `finally` blocks with nested try-catch. Java 7 introduced **try-with-resources** — a cleaner syntax that automatically closes any resource implementing `AutoCloseable` when the block exits.

---

## The Problem It Solves

Consider reading a file the old way:

```java
BufferedReader reader = null;
try {
    reader = new BufferedReader(new FileReader("data.txt"));
    String line = reader.readLine();
    System.out.println(line);
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
} finally {
    if (reader != null) {
        try {
            reader.close(); // close() itself can throw IOException
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

This is 15 lines of boilerplate. The nested try-catch inside `finally` is necessary because `close()` can also throw. And if both the `try` body and `close()` throw, the original exception is silently swallowed.

---

## try-with-resources Syntax

```java
try (ResourceType resource = new ResourceType()) {
    // use resource
} catch (ExceptionType e) {
    // handle exception
}
// resource.close() called automatically here
```

The resource is declared inside the parentheses. The JVM calls `close()` automatically when the block exits — whether normally, with an exception, or with a `return`.

### File Reading Example

```java
try (BufferedReader reader = new BufferedReader(new FileReader("data.txt"))) {
    String line = reader.readLine();
    System.out.println(line);
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
// reader.close() called automatically — no finally block needed
```

Same result, 5 lines instead of 15.

---

## Multiple Resources

Declare multiple resources separated by semicolons. They are closed in **reverse order** of declaration:

```java
try (
    Connection conn        = DriverManager.getConnection(DB_URL);
    PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users");
    ResultSet rs           = stmt.executeQuery()
) {
    while (rs.next()) {
        System.out.println(rs.getString("name"));
    }
} catch (SQLException e) {
    System.out.println("Database error: " + e.getMessage());
}
// Closed in order: rs → stmt → conn
```

Reverse-order closing ensures that dependent resources (a `ResultSet` depends on its `Statement`) are closed before the resource they depend on.

---

## AutoCloseable Interface

Any class that implements `AutoCloseable` (or its subinterface `Closeable`) can be used in a try-with-resources block.

```java
public interface AutoCloseable {
    void close() throws Exception;
}
```

`Closeable` (used by I/O streams) is a subinterface of `AutoCloseable` that narrows the checked exception to `IOException`.

### Writing Your Own AutoCloseable

```java
public class DatabaseConnection implements AutoCloseable {

    private final String url;

    public DatabaseConnection(String url) {
        this.url = url;
        System.out.println("Opened connection to: " + url);
    }

    public void query(String sql) {
        System.out.println("Executing: " + sql);
    }

    @Override
    public void close() {
        System.out.println("Closed connection to: " + url);
    }
}
```

```java
try (DatabaseConnection conn = new DatabaseConnection("jdbc:postgresql://localhost/mydb")) {
    conn.query("SELECT * FROM products");
}
```

**Output:**
```
Opened connection to: jdbc:postgresql://localhost/mydb
Executing: SELECT * FROM products
Closed connection to: jdbc:postgresql://localhost/mydb
```

`close()` runs automatically even if `query()` throws.

---

## Suppressed Exceptions

This is the most important improvement over manual `finally`. What happens when both the `try` body and `close()` throw?

**Old way (finally) — original exception is lost:**

```java
try {
    throw new RuntimeException("original error");
} finally {
    throw new RuntimeException("close error"); // original exception discarded!
}
// Only "close error" propagates — "original error" is gone
```

**try-with-resources — both exceptions are preserved:**

```java
class BrokenResource implements AutoCloseable {
    public void use() throws Exception {
        throw new Exception("error during use");
    }
    @Override
    public void close() throws Exception {
        throw new Exception("error during close");
    }
}

try (BrokenResource r = new BrokenResource()) {
    r.use();
} catch (Exception e) {
    System.out.println("Primary: " + e.getMessage());
    for (Throwable suppressed : e.getSuppressed()) {
        System.out.println("Suppressed: " + suppressed.getMessage());
    }
}
```

**Output:**
```
Primary: error during use
Suppressed: error during close
```

The primary exception propagates. The `close()` exception is attached as a **suppressed exception**, accessible via `e.getSuppressed()`. Nothing is lost.

---

## Effectively Final Variables (Java 9+)

From Java 9 onward, you can use an effectively final variable in the resource declaration instead of declaring it inline:

```java
var reader = new BufferedReader(new FileReader("data.txt"));
// reader is effectively final — not reassigned

try (reader) {  // Java 9+ syntax
    System.out.println(reader.readLine());
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
```

---

## When to Use try-with-resources

Use it whenever you open a resource that needs to be closed:

| Resource type | Class |
| --- | --- |
| File I/O | `FileInputStream`, `BufferedReader`, `PrintWriter` |
| Database | `Connection`, `PreparedStatement`, `ResultSet` |
| Network | `Socket`, `URLConnection` |
| Archives | `ZipFile`, `JarFile` |
| Any custom resource | Any class implementing `AutoCloseable` |

---

## Key Takeaways

- try-with-resources automatically calls `close()` on resources when the block exits
- Requires the resource to implement `AutoCloseable` or `Closeable`
- Multiple resources are closed in reverse order of declaration
- Suppressed exceptions preserve both the primary and close exceptions (unlike `finally`)
- Available from Java 7; Java 9 added support for effectively final variables

---

## Navigation

**← Previous:** [Custom Exceptions](/java/custom-exceptions)

**Next →** [Exception Propagation](/java/exception-propagation)
