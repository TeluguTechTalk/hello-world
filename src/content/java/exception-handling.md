---
layout: ../../layouts/BlogLayout.astro
title: Java Exception Handling Complete Guide – Beginner to Advanced
tag: Java Exception Handling
description: Master Java exception handling from basics to advanced. Covers try-catch, finally, throw vs throws, custom exceptions, try-with-resources, best practices, and interview questions with code examples.
---

Exception handling in Java is one of the most critical skills every developer needs. Whether you're building enterprise applications or learning Java for the first time, understanding how to handle errors gracefully separates good code from production-ready code.

This guide covers everything — from what an exception is to real-world patterns used in professional Java codebases.

---

## Table of Contents

1. [What is an Exception?](#what-is-an-exception)
2. [Why Exception Handling Matters](#why-exception-handling-matters)
3. [The Throwable Hierarchy](#the-throwable-hierarchy)
4. [Checked vs Unchecked Exceptions](#checked-vs-unchecked-exceptions)
5. [try-catch Block](#try-catch-block)
6. [Multiple catch Blocks](#multiple-catch-blocks)
7. [finally Block](#finally-block)
8. [throw vs throws](#throw-vs-throws)
9. [Custom Exceptions](#custom-exceptions)
10. [try-with-resources](#try-with-resources)
11. [Exception Propagation](#exception-propagation)
12. [Best Practices](#best-practices)
13. [Common Mistakes](#common-mistakes)
14. [Real-World Examples](#real-world-examples)
15. [Interview Questions](#interview-questions)

---

## What is an Exception?

An **exception** is an unexpected event that occurs during the execution of a program and disrupts the normal flow of instructions.

When Java encounters an error at runtime — like dividing by zero, accessing a null reference, or trying to open a file that doesn't exist — it **throws** an exception object. If that exception isn't caught and handled, the program terminates with an error message called a **stack trace**.

```java
public class Main {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3};
        System.out.println(numbers[10]); // throws ArrayIndexOutOfBoundsException
    }
}
```

**Output:**
```
Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 10 out of bounds for length 3
    at Main.main(Main.java:4)
```

Without exception handling, this crash is unavoidable. With it, you control what happens next.

---

## Why Exception Handling Matters

| Without Exception Handling | With Exception Handling |
| --- | --- |
| Program crashes abruptly | Program recovers or fails gracefully |
| User sees a cryptic stack trace | User sees a friendly error message |
| Resources (files, connections) may leak | Resources are properly closed |
| Hard to debug in production | Errors are logged with context |
| Cascading failures in larger systems | Errors are isolated to the failing component |

Exception handling lets you:
- **Separate error-handling logic** from normal program logic
- **Provide meaningful feedback** to users and logs
- **Clean up resources** like file handles and database connections
- **Recover from errors** when possible or fail predictably when not

---

## The Throwable Hierarchy

All exceptions in Java are objects that inherit from `java.lang.Throwable`. Understanding this hierarchy is key to knowing what to catch and when.

```
java.lang.Object
    └── java.lang.Throwable
            ├── java.lang.Error
            │       ├── OutOfMemoryError
            │       ├── StackOverflowError
            │       └── VirtualMachineError
            └── java.lang.Exception
                    ├── IOException
                    ├── SQLException
                    ├── ClassNotFoundException
                    └── RuntimeException (Unchecked)
                            ├── NullPointerException
                            ├── ArrayIndexOutOfBoundsException
                            ├── ArithmeticException
                            ├── ClassCastException
                            └── IllegalArgumentException
```

### Error vs Exception

| | Error | Exception |
| --- | --- | --- |
| Caused by | JVM / system-level failure | Application-level failure |
| Recoverable? | Almost never | Often yes |
| Should you catch it? | No (generally) | Yes |
| Examples | `OutOfMemoryError`, `StackOverflowError` | `IOException`, `NullPointerException` |

> **Rule of thumb:** Never catch `Error` unless you have a very specific reason (e.g., logging before shutdown). Errors signal that the JVM itself is in trouble.

---

## Checked vs Unchecked Exceptions

This is one of Java's most important distinctions.

### Checked Exceptions

The compiler **forces** you to handle or declare these. They represent conditions that a well-written application should anticipate and recover from.

```java
import java.io.*;

public class FileReader {
    public static void main(String[] args) {
        // Compiler ERROR if you don't handle IOException
        FileInputStream file = new FileInputStream("data.txt"); // throws IOException
    }
}
```

You must either use `try-catch` or declare `throws` in the method signature:

```java
// Option 1: Handle it
public static void readFile() {
    try {
        FileInputStream file = new FileInputStream("data.txt");
    } catch (FileNotFoundException e) {
        System.out.println("File not found: " + e.getMessage());
    }
}

// Option 2: Declare it
public static void readFile() throws FileNotFoundException {
    FileInputStream file = new FileInputStream("data.txt");
}
```

**Common Checked Exceptions:**
- `IOException`
- `FileNotFoundException`
- `SQLException`
- `ClassNotFoundException`
- `ParseException`

### Unchecked Exceptions

These extend `RuntimeException`. The compiler does **not** require you to handle them. They typically indicate programming bugs.

```java
public class Main {
    public static void main(String[] args) {
        String name = null;
        System.out.println(name.length()); // NullPointerException at runtime
    }
}
```

**Common Unchecked Exceptions:**
- `NullPointerException` — calling a method on a null reference
- `ArrayIndexOutOfBoundsException` — accessing an invalid array index
- `ArithmeticException` — e.g., division by zero
- `ClassCastException` — invalid type cast
- `NumberFormatException` — parsing an invalid number string
- `IllegalArgumentException` — invalid argument passed to a method
- `IllegalStateException` — object is in the wrong state for the operation

### Quick Comparison

| | Checked | Unchecked |
| --- | --- | --- |
| Extends | `Exception` (not `RuntimeException`) | `RuntimeException` |
| Compiler check | Required | Not required |
| Cause | External conditions (I/O, DB, network) | Programming bugs |
| When to use | Recoverable, expected failures | Logic errors, violations of contracts |

---

## try-catch Block

The `try-catch` block is the foundation of exception handling in Java.

### Syntax

```java
try {
    // Code that might throw an exception
} catch (ExceptionType e) {
    // Code to handle the exception
}
```

### Example

```java
public class DivisionExample {
    public static void main(String[] args) {
        int a = 10;
        int b = 0;

        try {
            int result = a / b;
            System.out.println("Result: " + result);
        } catch (ArithmeticException e) {
            System.out.println("Error: " + e.getMessage()); // / by zero
        }

        System.out.println("Program continues...");
    }
}
```

**Output:**
```
Error: / by zero
Program continues...
```

When the exception is caught, execution jumps to the `catch` block. After the catch block completes, the program continues normally — it does **not** go back to the line that threw the exception.

### The Exception Object

The variable `e` in `catch (ArithmeticException e)` is an instance of the exception class. Useful methods:

| Method | Description |
| --- | --- |
| `e.getMessage()` | Returns the error message |
| `e.toString()` | Returns class name + message |
| `e.printStackTrace()` | Prints the full stack trace to stderr |
| `e.getCause()` | Returns the original cause (if wrapped) |
| `e.getClass().getName()` | Returns the exception class name |

---

## Multiple catch Blocks

A single `try` block can have multiple `catch` blocks to handle different exception types.

```java
public class MultiCatch {
    public static void main(String[] args) {
        try {
            String[] names = {"Alice", "Bob"};
            String name = names[5];         // ArrayIndexOutOfBoundsException
            int length = name.length();     // NullPointerException (if null)
            int result = Integer.parseInt(name); // NumberFormatException
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

### Multi-catch (Java 7+)

When multiple exceptions need the same handling logic, use the pipe `|` operator:

```java
try {
    // risky code
} catch (IOException | SQLException e) {
    System.out.println("Data access error: " + e.getMessage());
    logger.error("Error", e);
}
```

### Catching a Parent Exception

You can catch a parent type to handle all its subtypes:

```java
try {
    // code
} catch (Exception e) {
    // catches ALL exceptions (use sparingly)
    System.out.println("Unexpected error: " + e.getMessage());
}
```

> **Important:** More specific `catch` blocks must come **before** more general ones. The compiler will reject unreachable catch blocks.

```java
// WRONG - won't compile
try { ... }
catch (Exception e) { ... }
catch (IOException e) { ... } // unreachable!

// CORRECT
try { ... }
catch (IOException e) { ... } // specific first
catch (Exception e) { ... }   // general last
```

---

## finally Block

The `finally` block always executes — whether an exception was thrown or not. It's used to release resources.

```java
try {
    // risky code
} catch (ExceptionType e) {
    // handle error
} finally {
    // always runs — cleanup goes here
}
```

### Example

```java
public class FinallyDemo {
    public static void main(String[] args) {
        try {
            System.out.println("Trying...");
            int result = 10 / 0;
            System.out.println("This won't print");
        } catch (ArithmeticException e) {
            System.out.println("Caught: " + e.getMessage());
        } finally {
            System.out.println("Finally always runs!");
        }
    }
}
```

**Output:**
```
Trying...
Caught: / by zero
Finally always runs!
```

### When finally Does NOT Run

The only case where `finally` is skipped is if the JVM exits during the try or catch block (e.g., `System.exit(0)` or a JVM crash).

### finally with return

Be careful when using `return` in a `finally` block — it overrides any `return` in the `try` or `catch`:

```java
public static int riskyMethod() {
    try {
        return 1;
    } finally {
        return 2; // This is the actual return value!
    }
}
// Returns 2, not 1
```

> **Best practice:** Avoid `return`, `throw`, `break`, or `continue` inside `finally`.

---

## throw vs throws

These two keywords look similar but serve completely different purposes.

### `throw`

Used to **explicitly throw an exception** from inside a method body.

```java
public class AgeValidator {
    public static void validateAge(int age) {
        if (age < 0) {
            throw new IllegalArgumentException("Age cannot be negative: " + age);
        }
        if (age > 150) {
            throw new IllegalArgumentException("Age seems unrealistic: " + age);
        }
        System.out.println("Valid age: " + age);
    }

    public static void main(String[] args) {
        validateAge(25);   // Valid age: 25
        validateAge(-5);   // throws IllegalArgumentException
    }
}
```

### `throws`

Used in a **method signature** to declare that the method might throw a checked exception. The caller must handle or re-declare it.

```java
import java.io.*;

public class FileProcessor {
    // Declares that this method might throw IOException
    public static String readFile(String path) throws IOException {
        BufferedReader reader = new BufferedReader(new FileReader(path));
        return reader.readLine();
    }

    public static void main(String[] args) {
        try {
            String content = readFile("config.txt");
            System.out.println(content);
        } catch (IOException e) {
            System.out.println("Could not read file: " + e.getMessage());
        }
    }
}
```

### Side-by-Side Comparison

| | `throw` | `throws` |
| --- | --- | --- |
| Where used | Inside method body | In method signature |
| Purpose | Actually throws an exception | Declares a potential exception |
| Followed by | An exception instance | Exception class name(s) |
| Required for | — | Checked exceptions propagated upward |
| Example | `throw new IOException("msg")` | `void read() throws IOException` |

---

## Custom Exceptions

Java lets you create your own exception classes to represent domain-specific errors. This makes your code more readable and gives callers precise exception types to catch.

### Creating a Checked Custom Exception

Extend `Exception`:

```java
public class InsufficientFundsException extends Exception {
    private double amount;

    public InsufficientFundsException(double amount) {
        super("Insufficient funds. Shortfall: $" + amount);
        this.amount = amount;
    }

    public double getAmount() {
        return amount;
    }
}
```

### Creating an Unchecked Custom Exception

Extend `RuntimeException`:

```java
public class InvalidUserException extends RuntimeException {
    private String userId;

    public InvalidUserException(String userId) {
        super("No user found with ID: " + userId);
        this.userId = userId;
    }

    public String getUserId() {
        return userId;
    }
}
```

### Using Custom Exceptions

```java
public class BankAccount {
    private double balance;

    public BankAccount(double initialBalance) {
        this.balance = initialBalance;
    }

    public void withdraw(double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException(amount - balance);
        }
        balance -= amount;
        System.out.println("Withdrawal successful. Balance: $" + balance);
    }

    public static void main(String[] args) {
        BankAccount account = new BankAccount(100.0);

        try {
            account.withdraw(150.0);
        } catch (InsufficientFundsException e) {
            System.out.println("Transaction failed: " + e.getMessage());
            System.out.println("You need $" + e.getAmount() + " more.");
        }
    }
}
```

**Output:**
```
Transaction failed: Insufficient funds. Shortfall: $50.0
You need $50.0 more.
```

### Custom Exception with Cause

Always provide a constructor that accepts a `Throwable cause` for wrapping lower-level exceptions:

```java
public class DataAccessException extends RuntimeException {
    public DataAccessException(String message) {
        super(message);
    }

    public DataAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}

// Usage
try {
    // database operation
} catch (SQLException e) {
    throw new DataAccessException("Failed to fetch user record", e);
}
```

---

## try-with-resources

Introduced in **Java 7**, `try-with-resources` automatically closes resources that implement `AutoCloseable` or `Closeable`. It eliminates the boilerplate of `finally` blocks just for closing resources.

### Before Java 7 (verbose)

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
            reader.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### With try-with-resources (clean)

```java
try (BufferedReader reader = new BufferedReader(new FileReader("data.txt"))) {
    String line = reader.readLine();
    System.out.println(line);
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
// reader.close() is called automatically!
```

### Multiple Resources

```java
try (
    Connection conn = DriverManager.getConnection(DB_URL);
    PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users");
    ResultSet rs = stmt.executeQuery()
) {
    while (rs.next()) {
        System.out.println(rs.getString("name"));
    }
} catch (SQLException e) {
    System.out.println("Database error: " + e.getMessage());
}
// All three closed automatically, in reverse order: rs → stmt → conn
```

### Custom AutoCloseable

```java
public class DatabaseConnection implements AutoCloseable {
    public DatabaseConnection() {
        System.out.println("Connection opened");
    }

    public void query(String sql) {
        System.out.println("Executing: " + sql);
    }

    @Override
    public void close() {
        System.out.println("Connection closed");
    }
}

// Usage
try (DatabaseConnection conn = new DatabaseConnection()) {
    conn.query("SELECT * FROM products");
}
```

**Output:**
```
Connection opened
Executing: SELECT * FROM products
Connection closed
```

---

## Exception Propagation

When an exception is thrown inside a method and not caught there, it **propagates** up the call stack to the caller. This continues until either a catch block handles it or the program terminates.

```java
public class PropagationDemo {

    static void level3() {
        int result = 10 / 0; // throws ArithmeticException
    }

    static void level2() {
        level3(); // exception propagates here
    }

    static void level1() {
        level2(); // and here
    }

    public static void main(String[] args) {
        try {
            level1(); // caught here
        } catch (ArithmeticException e) {
            System.out.println("Caught in main: " + e.getMessage());
        }
    }
}
```

**Output:**
```
Caught in main: / by zero
```

### Exception Chaining

When catching one exception and throwing another, preserve the original cause to avoid losing debugging information:

```java
public class ServiceLayer {
    public User getUser(int id) {
        try {
            return database.findUser(id);
        } catch (SQLException e) {
            // Wrap, don't swallow
            throw new ServiceException("Failed to retrieve user " + id, e);
        }
    }
}
```

This preserves the full stack trace when you call `e.getCause()` or print the stack trace.

### Re-throwing Exceptions

```java
public void processFile(String path) throws IOException {
    try {
        // file operations
    } catch (IOException e) {
        logger.error("Failed to process: " + path, e);
        throw e; // re-throw after logging
    }
}
```

---

## Best Practices

### 1. Catch specific exceptions, not `Exception`

```java
// Bad
catch (Exception e) { ... }

// Good
catch (FileNotFoundException e) { ... }
catch (IOException e) { ... }
```

### 2. Never swallow exceptions silently

```java
// Bad - you'll never know something went wrong
catch (IOException e) {
    // do nothing
}

// Good
catch (IOException e) {
    logger.error("Failed to read config", e);
    throw new ConfigurationException("Could not load application config", e);
}
```

### 3. Always log the full exception, not just the message

```java
// Bad - loses stack trace
logger.error("Error: " + e.getMessage());

// Good
logger.error("Error processing request", e);
```

### 4. Use custom exceptions for domain errors

```java
// Bad - generic and loses context
throw new Exception("Something went wrong");

// Good - precise, informative, catchable by callers
throw new OrderNotFoundException(orderId);
```

### 5. Clean up resources with try-with-resources

Prefer `try-with-resources` over manual `finally` blocks for any `Closeable`.

### 6. Don't use exceptions for control flow

```java
// Bad - exceptions are expensive; don't use them for normal logic
try {
    int value = Integer.parseInt(input);
} catch (NumberFormatException e) {
    value = 0; // treating exception as "else"
}

// Good
if (input != null && input.matches("\\d+")) {
    int value = Integer.parseInt(input);
} else {
    int value = 0;
}
```

### 7. Document exceptions with Javadoc

```java
/**
 * Transfers funds between accounts.
 *
 * @throws InsufficientFundsException if the source account has insufficient balance
 * @throws AccountNotFoundException if either account ID is invalid
 */
public void transfer(String fromId, String toId, double amount)
    throws InsufficientFundsException, AccountNotFoundException { ... }
```

### 8. Fail fast with meaningful messages

```java
public void setAge(int age) {
    if (age < 0 || age > 150) {
        throw new IllegalArgumentException(
            "Age must be between 0 and 150, but was: " + age
        );
    }
    this.age = age;
}
```

---

## Common Mistakes

### Mistake 1: Catching `Exception` or `Throwable` too broadly

```java
// Dangerous - catches OutOfMemoryError, NullPointerException, everything
try {
    doSomething();
} catch (Throwable t) {
    // ignore
}
```

### Mistake 2: Losing the original exception cause

```java
// Bad - original SQLException is lost
catch (SQLException e) {
    throw new RuntimeException("DB error"); // cause not preserved!
}

// Good
catch (SQLException e) {
    throw new RuntimeException("DB error", e); // cause preserved
}
```

### Mistake 3: Using `return` inside `finally`

```java
// Bug: always returns false, even when try succeeds
public boolean save() {
    try {
        database.save();
        return true;
    } finally {
        return false; // overrides the return true above!
    }
}
```

### Mistake 4: Not closing resources in the right order

```java
// Bug: if stmt.close() throws, conn.close() never runs
finally {
    stmt.close();
    conn.close();
}

// Use try-with-resources instead — it handles this correctly
```

### Mistake 5: Declaring overly broad `throws`

```java
// Too broad - callers don't know what to expect
public void process() throws Exception { ... }

// Better
public void process() throws IOException, ValidationException { ... }
```

### Mistake 6: `NullPointerException` from not checking nulls

```java
// Bug
String value = map.get("key").trim(); // NPE if key absent

// Fixed
String raw = map.get("key");
String value = (raw != null) ? raw.trim() : "";
```

---

## Real-World Examples

### 1. File Reading with Proper Error Handling

```java
import java.io.*;
import java.nio.file.*;

public class ConfigLoader {
    public static Properties loadConfig(String filePath) {
        Properties props = new Properties();

        try (InputStream input = Files.newInputStream(Paths.get(filePath))) {
            props.load(input);
            System.out.println("Config loaded successfully");
        } catch (NoSuchFileException e) {
            System.err.println("Config file not found: " + filePath);
            // Return defaults or throw a specific exception
        } catch (IOException e) {
            System.err.println("Error reading config: " + e.getMessage());
            throw new RuntimeException("Failed to load configuration", e);
        }

        return props;
    }
}
```

### 2. REST API Service Layer

```java
@Service
public class UserService {

    public User getUserById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("User ID must be a positive number");
        }

        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found: " + id));
    }

    public User createUser(UserRequest request) {
        try {
            validateRequest(request);
            return userRepository.save(new User(request));
        } catch (DataIntegrityViolationException e) {
            throw new DuplicateEmailException(
                "Email already registered: " + request.getEmail(), e
            );
        }
    }
}
```

### 3. Database Transaction with Rollback

```java
public void transferFunds(Long fromId, Long toId, BigDecimal amount) {
    TransactionStatus tx = transactionManager.getTransaction(new DefaultTransactionDefinition());

    try {
        Account from = accountRepo.findById(fromId)
            .orElseThrow(() -> new AccountNotFoundException(fromId));
        Account to = accountRepo.findById(toId)
            .orElseThrow(() -> new AccountNotFoundException(toId));

        if (from.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException(fromId, amount);
        }

        from.debit(amount);
        to.credit(amount);

        accountRepo.save(from);
        accountRepo.save(to);

        transactionManager.commit(tx);
    } catch (Exception e) {
        transactionManager.rollback(tx);
        throw e;
    }
}
```

### 4. Input Validation with Custom Exceptions

```java
public class OrderService {

    public Order placeOrder(OrderRequest request) {
        validateOrder(request);
        // proceed...
        return orderRepository.save(new Order(request));
    }

    private void validateOrder(OrderRequest request) {
        List<String> errors = new ArrayList<>();

        if (request.getProductId() == null) {
            errors.add("Product ID is required");
        }
        if (request.getQuantity() <= 0) {
            errors.add("Quantity must be greater than zero");
        }
        if (request.getShippingAddress() == null || request.getShippingAddress().isBlank()) {
            errors.add("Shipping address is required");
        }

        if (!errors.isEmpty()) {
            throw new ValidationException("Order validation failed", errors);
        }
    }
}
```

---

## Interview Questions

### Q1: What is the difference between `Error` and `Exception`?

**Answer:** Both extend `Throwable`. `Error` represents serious problems the JVM itself encounters (like `OutOfMemoryError`) — these are generally unrecoverable and should not be caught. `Exception` represents conditions the application might reasonably handle. `RuntimeException` and its subclasses are unchecked; everything else under `Exception` is checked.

---

### Q2: Can `finally` block be skipped?

**Answer:** Yes, in one scenario: if `System.exit()` is called inside the `try` or `catch` block, the JVM shuts down and `finally` does not run. A JVM crash or power failure also prevents it. Otherwise, `finally` always executes — even if a `return` or uncaught exception is in play.

---

### Q3: What is exception chaining?

**Answer:** Exception chaining (or wrapping) is the practice of catching one exception and throwing another while preserving the original as the `cause`. This avoids losing diagnostic information. Use `new Exception("message", originalException)` and retrieve the original with `getCause()`.

---

### Q4: What's the difference between `throw` and `throws`?

**Answer:** `throw` is used inside a method body to actually throw an exception instance. `throws` is used in a method signature to declare that the method might propagate a checked exception to its caller.

---

### Q5: When should you use a checked vs unchecked exception?

**Answer:** Use **checked exceptions** when the caller can reasonably recover from the failure (e.g., file not found — maybe try a default location). Use **unchecked exceptions** for programming errors (invalid arguments, null where not expected) or conditions where no reasonable recovery is possible at the call site.

---

### Q6: What is try-with-resources and why is it better than `finally`?

**Answer:** `try-with-resources` (Java 7+) automatically closes any resource that implements `AutoCloseable` at the end of the try block — even if an exception is thrown. It's better than `finally` because it handles the case where both the try block and the close operation throw exceptions (using *suppressed exceptions*), whereas a `finally`-based close would silently discard the original exception.

---

### Q7: Can you catch multiple exceptions in a single catch block?

**Answer:** Yes, since Java 7, using the multi-catch syntax: `catch (IOException | SQLException e)`. The caught variable is implicitly `final`. This avoids duplicate handling code when different exception types require the same response.

---

### Q8: What happens if an exception is thrown inside a `catch` block?

**Answer:** The new exception propagates up the call stack normally, just as if it had been thrown outside any try-catch. The original exception is no longer being handled (unless you chain it as the cause of the new one).

---

### Q9: Is it good practice to catch `Exception` as a catch-all?

**Answer:** Generally no — it catches unchecked exceptions and hides bugs. An acceptable pattern is a top-level catch-all in a web framework's global exception handler or a `main` method that wants to log and exit gracefully. Everywhere else, catch only what you can actually handle.

---

### Q10: What are suppressed exceptions?

**Answer:** When `try-with-resources` closes a resource, if both the try block and the `close()` method throw exceptions, the `close()` exception is attached to the primary exception as a *suppressed exception* rather than discarding one. You can access them via `e.getSuppressed()`. This is a Java 7+ feature specific to `try-with-resources`.

```java
try (MyResource r = new MyResource()) {
    throw new RuntimeException("primary");
    // if r.close() also throws, that's a suppressed exception
} catch (RuntimeException e) {
    Throwable[] suppressed = e.getSuppressed(); // [close exception]
}
```

---

## Summary

| Concept | Key Point |
| --- | --- |
| `try-catch` | Wrap risky code; handle specific exception types |
| `finally` | Always runs; use for cleanup (prefer try-with-resources) |
| `throw` | Explicitly throw an exception instance from code |
| `throws` | Declare a checked exception in a method signature |
| Checked exceptions | Compiler-enforced; recoverable conditions |
| Unchecked exceptions | Runtime bugs; extend `RuntimeException` |
| Custom exceptions | Extend `Exception` or `RuntimeException` for domain errors |
| try-with-resources | Auto-close `AutoCloseable` resources (Java 7+) |
| Exception chaining | Preserve original cause when wrapping exceptions |
| Exception propagation | Uncaught exceptions travel up the call stack |

Exception handling is not just about preventing crashes — it's about writing code that communicates clearly when things go wrong, cleans up after itself, and gives callers the information they need to respond appropriately.
