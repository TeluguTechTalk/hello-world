---
layout: ../../layouts/BlogLayout.astro
title: Exception Handling in Java Explained with Real Examples
tag: Java Exception Handling
---

Exception handling in Java helps applications handle runtime errors gracefully without crashing the entire application.

## What is Exception Handling?

Exception handling is a mechanism used to handle runtime errors such as divide by zero, file not found and invalid input.

## Why Do We Use It?

Without exception handling, the application may terminate suddenly. Using try-catch blocks helps maintain smooth program flow.

## Simple Example

```java
public class Main {
    public static void main(String[] args) {
        try {
            int result = 10 / 0;
            System.out.println(result);
        } catch (ArithmeticException e) {
            System.out.println("Cannot divide by zero");
        }
    }
}
```

## Output
Cannot divide by zero

## Interview Tip
Checked exceptions are checked at compile time, while unchecked exceptions occur during runtime.