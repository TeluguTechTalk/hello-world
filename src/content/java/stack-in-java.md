---
layout: ../../layouts/BlogLayout.astro
title: Stack in Java – Complete Guide
tag: Java Collections Framework
description: Learn about Java Stack — LIFO operations, its inheritance from Vector, why Deque is preferred for stack use cases, and practical examples of stack-based algorithms.
---

`java.util.Stack` is a LIFO (Last-In, First-Out) data structure introduced in Java 1.0. It extends `Vector`, which gives it synchronized access but also exposes all of `Vector`'s random-access methods — an API design that is widely considered a mistake. Modern Java code prefers `ArrayDeque` for stack operations.

---

## LIFO — Last In, First Out

A stack works like a physical stack of plates: you can only add to the top (push) and remove from the top (pop). The last item added is the first item retrieved.

```
Push "A" → [A]
Push "B" → [A, B]
Push "C" → [A, B, C]
Pop       → returns "C" → [A, B]
Pop       → returns "B" → [A]
```

---

## Core Methods

```java
import java.util.Stack;

Stack<String> stack = new Stack<>();

// Push — adds to the top
stack.push("Alice");   // [Alice]
stack.push("Bob");     // [Alice, Bob]
stack.push("Carol");   // [Alice, Bob, Carol]

// Peek — view top without removing
String top = stack.peek();  // "Carol" — stack unchanged

// Pop — remove and return top
String removed = stack.pop();  // "Carol" — stack is [Alice, Bob]

// Empty check
boolean empty = stack.empty();  // false

// Search — 1-based distance from top, or -1 if absent
int pos = stack.search("Alice"); // 2 — Alice is 2 positions from top
```

---

## Inheriting From Vector — The Design Problem

`Stack` extends `Vector`, which means it inherits every `List` method. This breaks the stack abstraction:

```java
Stack<String> stack = new Stack<>();
stack.push("Alice");
stack.push("Bob");

// These should not exist on a stack:
stack.add(0, "Charlie");  // insert at bottom — breaks LIFO
stack.remove(0);           // remove from bottom — breaks LIFO
stack.get(1);              // random access — exposes internals
```

A clean stack API should only allow push, pop, and peek. The Javadoc itself states: *"A more complete and consistent set of LIFO stack operations is provided by the Deque interface and its implementations, which should be used in preference to this class."*

---

## The Modern Alternative: ArrayDeque as Stack

```java
import java.util.ArrayDeque;
import java.util.Deque;

Deque<String> stack = new ArrayDeque<>();

stack.push("Alice");   // addFirst
stack.push("Bob");     // addFirst — [Bob, Alice]
stack.push("Carol");   // addFirst — [Carol, Bob, Alice]

String top = stack.peek();     // "Carol" — peekFirst
String removed = stack.pop();  // "Carol" — removeFirst
```

`ArrayDeque` is:
- **Faster** — backed by a resizable array with no synchronization overhead
- **More memory-efficient** — no `Node` objects like `LinkedList`
- **Cleaner API** — use only `push`/`pop`/`peek` to enforce LIFO discipline

---

## Stack vs ArrayDeque

| Feature | `Stack` | `ArrayDeque` |
| --- | --- | --- |
| Thread safety | Synchronized (Vector) | Not synchronized |
| Performance | Slower (lock overhead) | Faster |
| Memory | Node overhead (inherits Vector) | Compact array |
| Null elements | Allowed | Not allowed |
| LIFO enforcement | No (exposes List methods) | Partial (push/pop/peek) |
| Recommended for new code | No | Yes |

---

## Practical Stack Use Cases

### 1. Balanced Parentheses Check

```java
public static boolean isBalanced(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '{' || c == '[') {
            stack.push(c);
        } else if (c == ')' || c == '}' || c == ']') {
            if (stack.isEmpty()) return false;
            char top = stack.pop();
            if ((c == ')' && top != '(') ||
                (c == '}' && top != '{') ||
                (c == ']' && top != '[')) {
                return false;
            }
        }
    }
    return stack.isEmpty();
}

System.out.println(isBalanced("({[]})")); // true
System.out.println(isBalanced("({[}])"));  // false
```

### 2. Undo/Redo

```java
Deque<String> undoStack = new ArrayDeque<>();
Deque<String> redoStack = new ArrayDeque<>();

void doAction(String action) {
    undoStack.push(action);
    redoStack.clear();
}

void undo() {
    if (!undoStack.isEmpty()) {
        redoStack.push(undoStack.pop());
    }
}

void redo() {
    if (!redoStack.isEmpty()) {
        undoStack.push(redoStack.pop());
    }
}
```

### 3. Reverse a String

```java
public static String reverse(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    for (char c : s.toCharArray()) stack.push(c);
    StringBuilder sb = new StringBuilder();
    while (!stack.isEmpty()) sb.append(stack.pop());
    return sb.toString();
}

System.out.println(reverse("hello")); // "olleh"
```

### 4. Expression Evaluation (Postfix / RPN)

```java
public static int evalRPN(String[] tokens) {
    Deque<Integer> stack = new ArrayDeque<>();
    for (String token : tokens) {
        switch (token) {
            case "+" -> stack.push(stack.pop() + stack.pop());
            case "-" -> { int b = stack.pop(); stack.push(stack.pop() - b); }
            case "*" -> stack.push(stack.pop() * stack.pop());
            case "/" -> { int b = stack.pop(); stack.push(stack.pop() / b); }
            default  -> stack.push(Integer.parseInt(token));
        }
    }
    return stack.pop();
}

// "3 4 + 2 *" = (3+4)*2 = 14
System.out.println(evalRPN(new String[]{"3","4","+","2","*"})); // 14
```

---

## Key Takeaways

- `Stack` is a LIFO structure that extends `Vector` — a design Java itself now discourages
- Prefer `ArrayDeque` for all new stack implementations — faster, lighter, no lock overhead
- Core operations: push, pop, peek, empty, search
- Classic stack use cases: balanced brackets, DFS, undo/redo, expression evaluation

---

## Navigation

**← Previous:** [Vector in Java](/java/vector-in-java)

**Next →** [The Set Interface](/java/set-interface)
