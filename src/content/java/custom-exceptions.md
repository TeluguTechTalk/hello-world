---
layout: ../../layouts/BlogLayout.astro
title: Custom Exceptions in Java – How to Create and Use Them
tag: Java Exception Handling
description: Learn how to create custom exception classes in Java — checked and unchecked, with cause constructors, extra fields, and real domain-specific examples like InsufficientFundsException.
---

Java's built-in exceptions cover general failures, but most real applications need domain-specific exception types. Custom exceptions make your code more readable, give callers precise types to catch, and carry richer context about what went wrong.

---

## Why Custom Exceptions?

```java
// Generic — tells the caller almost nothing
throw new RuntimeException("Something went wrong");

// Specific — tells the caller exactly what happened
throw new InsufficientFundsException(orderId, requiredAmount, availableBalance);
```

Custom exceptions let you:
- Name the failure clearly (`OrderNotFoundException`, `DuplicateEmailException`)
- Carry domain-specific data (order ID, amount, user ID)
- Give callers a precise type to catch without catching everything
- Separate application errors from infrastructure errors

---

## Creating a Checked Custom Exception

Extend `Exception` to create a checked exception — the compiler forces callers to handle or declare it.

```java
public class InsufficientFundsException extends Exception {

    private final double shortfall;

    public InsufficientFundsException(double shortfall) {
        super("Insufficient funds. Shortfall: $" + shortfall);
        this.shortfall = shortfall;
    }

    // Always provide a cause constructor for wrapping
    public InsufficientFundsException(double shortfall, Throwable cause) {
        super("Insufficient funds. Shortfall: $" + shortfall, cause);
        this.shortfall = shortfall;
    }

    public double getShortfall() {
        return shortfall;
    }
}
```

---

## Creating an Unchecked Custom Exception

Extend `RuntimeException` for exceptions that do not require the compiler to enforce handling — typically for programming errors or conditions no caller can meaningfully recover from.

```java
public class UserNotFoundException extends RuntimeException {

    private final String userId;

    public UserNotFoundException(String userId) {
        super("No user found with ID: " + userId);
        this.userId = userId;
    }

    public UserNotFoundException(String userId, Throwable cause) {
        super("No user found with ID: " + userId, cause);
        this.userId = userId;
    }

    public String getUserId() {
        return userId;
    }
}
```

---

## The Cause Constructor — Always Include It

Every custom exception should have a constructor that accepts a `Throwable cause`. This lets you wrap low-level exceptions without losing the original stack trace:

```java
// Without cause — original context is lost
catch (SQLException e) {
    throw new DataAccessException("Failed to fetch user");
}

// With cause — full context preserved
catch (SQLException e) {
    throw new DataAccessException("Failed to fetch user", e);
}
```

When you call `e.getCause()` or print the stack trace of `DataAccessException`, the original `SQLException` (with its own message and trace) is still there.

---

## Using Custom Exceptions — Full Example

```java
public class BankAccount {

    private double balance;

    public BankAccount(double initialBalance) {
        this.balance = initialBalance;
    }

    public void withdraw(double amount) throws InsufficientFundsException {
        if (amount <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive");
        }
        if (amount > balance) {
            throw new InsufficientFundsException(amount - balance);
        }
        balance -= amount;
        System.out.printf("Withdrew $%.2f. Remaining balance: $%.2f%n", amount, balance);
    }

    public static void main(String[] args) {
        BankAccount account = new BankAccount(100.0);

        try {
            account.withdraw(150.0);
        } catch (InsufficientFundsException e) {
            System.out.println("Transaction declined: " + e.getMessage());
            System.out.printf("You need $%.2f more to complete this withdrawal.%n", e.getShortfall());
        }
    }
}
```

**Output:**
```
Transaction declined: Insufficient funds. Shortfall: $50.0
You need $50.00 more to complete this withdrawal.
```

---

## Exception Hierarchy for a Domain

In larger applications, structure your custom exceptions in a hierarchy so callers can catch at different levels of specificity:

```java
// Base exception for all payment-related errors
public class PaymentException extends RuntimeException {
    public PaymentException(String message) { super(message); }
    public PaymentException(String message, Throwable cause) { super(message, cause); }
}

// Specific subtypes
public class InsufficientFundsException extends PaymentException {
    private final double shortfall;
    public InsufficientFundsException(double shortfall) {
        super("Insufficient funds. Shortfall: $" + shortfall);
        this.shortfall = shortfall;
    }
    public double getShortfall() { return shortfall; }
}

public class PaymentGatewayException extends PaymentException {
    public PaymentGatewayException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

Callers can now catch either the specific type or the base type:

```java
try {
    paymentService.charge(order);
} catch (InsufficientFundsException e) {
    // handle specifically
    notifyUser("Low balance: " + e.getShortfall());
} catch (PaymentException e) {
    // handle any other payment error
    logger.error("Payment failed", e);
}
```

---

## Custom Exception Checklist

| Item | Why |
| --- | --- |
| Extend `Exception` or `RuntimeException` | Determines checked vs unchecked |
| Call `super(message)` | Ensures `getMessage()` works |
| Add a `(String, Throwable)` constructor | Preserves the original cause chain |
| Add extra fields for domain context | Gives callers structured data, not just a string |
| Use a meaningful class name | `OrderNotFoundException` beats `AppException` |
| Document with `@throws` Javadoc | Tells users of your API what to expect |

---

## Key Takeaways

- Extend `Exception` for checked custom exceptions, `RuntimeException` for unchecked
- Always include a cause constructor `(String message, Throwable cause)`
- Add domain-specific fields to carry structured context
- Build exception hierarchies so callers can catch at the right level
- Name exceptions clearly after the domain concept that failed

---

## Navigation

**← Previous:** [throw vs throws](/java/throw-vs-throws)

**Next →** [try-with-resources](/java/try-with-resources)
