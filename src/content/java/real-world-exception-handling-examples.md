---
layout: ../../layouts/BlogLayout.astro
title: Real-World Java Exception Handling Examples
tag: Java Exception Handling
description: Practical Java exception handling examples for real applications — file I/O, REST API service layers, database transactions with rollback, and input validation with custom exceptions.
---

The best way to solidify exception handling knowledge is to see it applied to real scenarios. This article walks through four complete, production-style examples covering the most common situations Java developers encounter.

---

## Example 1 — File I/O With Proper Error Handling

Reading configuration files is a common source of startup failures. The key is distinguishing between a missing file (recoverable — load defaults) and a corrupt file (unrecoverable — fail fast).

```java
import java.io.*;
import java.nio.file.*;
import java.util.Properties;

public class ConfigLoader {

    private static final String DEFAULT_CONFIG = "config/defaults.properties";

    public static Properties load(String filePath) {
        Properties props = new Properties();

        try (InputStream input = Files.newInputStream(Paths.get(filePath))) {
            props.load(input);
            System.out.println("Config loaded from: " + filePath);

        } catch (NoSuchFileException e) {
            System.err.println("Config not found at " + filePath + " — loading defaults");
            return loadDefaults();

        } catch (IOException e) {
            // File exists but cannot be read — this is a hard failure
            throw new RuntimeException(
                "Failed to read configuration from " + filePath, e
            );
        }

        return props;
    }

    private static Properties loadDefaults() {
        Properties defaults = new Properties();
        try (InputStream in = ConfigLoader.class
                .getClassLoader()
                .getResourceAsStream(DEFAULT_CONFIG)) {

            if (in == null) {
                throw new RuntimeException("Built-in defaults not found — application cannot start");
            }
            defaults.load(in);

        } catch (IOException e) {
            throw new RuntimeException("Failed to load built-in defaults", e);
        }
        return defaults;
    }
}
```

**What this demonstrates:**
- `NoSuchFileException` is caught specifically and handled with a fallback
- `IOException` (other read errors) is re-thrown as an unchecked exception — the app cannot proceed
- try-with-resources ensures the stream is always closed
- The cause is always preserved when wrapping

---

## Example 2 — REST API Service Layer

In a Spring-style service, every failure should translate into a meaningful exception that the controller or global exception handler can map to an HTTP response.

```java
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUserById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                "User ID must be a positive number, got: " + id
            );
        }

        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(
                "No user exists with id " + id
            ));
    }

    public User createUser(CreateUserRequest request) {
        validateCreateRequest(request);

        try {
            return userRepository.save(new User(request));

        } catch (DataIntegrityViolationException e) {
            // Translate DB constraint violation into a domain exception
            throw new DuplicateEmailException(
                "Email already registered: " + request.getEmail(), e
            );
        }
    }

    private void validateCreateRequest(CreateUserRequest request) {
        if (request.getEmail() == null || !request.getEmail().contains("@")) {
            throw new ValidationException("Invalid email address: " + request.getEmail());
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ValidationException("Name must not be blank");
        }
    }
}
```

**What this demonstrates:**
- Input validation uses `IllegalArgumentException` for programming errors
- Missing entity uses a custom `UserNotFoundException` (unchecked, maps to HTTP 404)
- DB constraint violation is wrapped in a domain-specific exception (not leaked to callers)
- Validation errors use a dedicated `ValidationException` (maps to HTTP 400)
- Cause is always chained when wrapping infrastructure exceptions

---

## Example 3 — Database Transaction With Rollback

Financial operations must be atomic. If any step fails, all changes must be rolled back.

```java
import java.math.BigDecimal;

@Service
public class FundsTransferService {

    private final AccountRepository accountRepo;
    private final TransactionManager txManager;

    public TransferResult transfer(Long fromId, Long toId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transfer amount must be positive");
        }

        TransactionStatus tx = txManager.getTransaction(
            new DefaultTransactionDefinition()
        );

        try {
            Account from = accountRepo.findById(fromId)
                .orElseThrow(() -> new AccountNotFoundException(fromId));
            Account to = accountRepo.findById(toId)
                .orElseThrow(() -> new AccountNotFoundException(toId));

            if (from.getBalance().compareTo(amount) < 0) {
                throw new InsufficientFundsException(
                    fromId,
                    amount,
                    from.getBalance()
                );
            }

            from.debit(amount);
            to.credit(amount);

            accountRepo.save(from);
            accountRepo.save(to);

            txManager.commit(tx);

            return TransferResult.success(from.getBalance());

        } catch (Exception e) {
            txManager.rollback(tx);
            throw e; // re-throw after rollback
        }
    }
}
```

**What this demonstrates:**
- Input validation before any I/O
- `AccountNotFoundException` and `InsufficientFundsException` are domain exceptions
- The `catch (Exception e)` here is intentional: it triggers rollback for **any** failure, then re-throws so the caller still receives the original exception
- Rollback happens before re-throw so the database is always left in a consistent state

---

## Example 4 — Input Validation With Aggregated Errors

Instead of throwing on the first validation failure, collect all errors and report them together. This is the pattern used in REST APIs for form validation.

```java
import java.util.ArrayList;
import java.util.List;

public class OrderService {

    public Order placeOrder(OrderRequest request) {
        validateOrder(request);
        return orderRepository.save(new Order(request));
    }

    private void validateOrder(OrderRequest request) {
        List<String> errors = new ArrayList<>();

        if (request.getProductId() == null) {
            errors.add("productId: must not be null");
        }

        if (request.getQuantity() <= 0) {
            errors.add("quantity: must be greater than zero (got " + request.getQuantity() + ")");
        }

        if (request.getShippingAddress() == null || request.getShippingAddress().isBlank()) {
            errors.add("shippingAddress: must not be blank");
        }

        if (request.getPaymentMethod() == null) {
            errors.add("paymentMethod: must not be null");
        }

        if (!errors.isEmpty()) {
            throw new ValidationException("Order validation failed", errors);
        }
    }
}
```

```java
public class ValidationException extends RuntimeException {

    private final List<String> errors;

    public ValidationException(String message, List<String> errors) {
        super(message + ": " + errors);
        this.errors = List.copyOf(errors);
    }

    public List<String> getErrors() {
        return errors;
    }
}
```

A caller or global exception handler can then map `ValidationException.getErrors()` to a structured JSON response:

```json
{
  "status": 400,
  "message": "Order validation failed",
  "errors": [
    "productId: must not be null",
    "quantity: must be greater than zero (got -1)"
  ]
}
```

**What this demonstrates:**
- Collect all errors before throwing — better UX than throwing on first failure
- Custom `ValidationException` carries a typed `List<String>`, not just a message string
- The unchecked exception can be caught by a global handler without cluttering service signatures

---

## Patterns Across All Examples

| Pattern | Seen In |
| --- | --- |
| Specific exception types for specific failures | All examples |
| Cause preserved when wrapping | Examples 1, 2 |
| try-with-resources for streams | Example 1 |
| Failing fast with illegal argument checks | Examples 2, 3, 4 |
| Domain exceptions translated from infrastructure exceptions | Examples 2, 3 |
| Aggregated validation errors | Example 4 |

---

## Navigation

**← Previous:** [Common Exception Mistakes](/java/common-exception-mistakes)

**Next →** [Java Exception Handling Interview Questions](/java/java-exception-handling-interview-questions)
