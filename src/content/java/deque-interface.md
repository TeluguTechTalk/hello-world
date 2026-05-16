---
layout: ../../layouts/BlogLayout.astro
title: The Deque Interface in Java
tag: Java Collections Framework
description: Learn the Java Deque interface — double-ended queue operations, ArrayDeque vs LinkedList, using Deque as stack or queue, and real-world use cases.
---

`Deque` (pronounced "deck") stands for **Double-Ended Queue**. It extends `Queue` and adds methods to insert, remove, and examine elements at **both ends**. A `Deque` can be used as a FIFO queue, a LIFO stack, or a sliding window — making it one of the most versatile structures in the Collections Framework.

---

## Deque Methods

`Deque` provides three layers of methods. The first two are analogous to the `Queue` interface:

### At the Head (Front)

| Operation | Throws Exception | Returns null/false |
| --- | --- | --- |
| Insert at front | `addFirst(e)` | `offerFirst(e)` |
| Remove from front | `removeFirst()` | `pollFirst()` |
| Examine front | `getFirst()` | `peekFirst()` |

### At the Tail (Back)

| Operation | Throws Exception | Returns null/false |
| --- | --- | --- |
| Insert at back | `addLast(e)` | `offerLast(e)` |
| Remove from back | `removeLast()` | `pollLast()` |
| Examine back | `getLast()` | `peekLast()` |

### Stack Aliases (Deque as Stack)

| Stack Method | Equivalent Deque Method |
| --- | --- |
| `push(e)` | `addFirst(e)` |
| `pop()` | `removeFirst()` |
| `peek()` | `peekFirst()` |

### Queue Aliases (Deque as Queue)

| Queue Method | Equivalent Deque Method |
| --- | --- |
| `offer(e)` | `offerLast(e)` |
| `poll()` | `pollFirst()` |
| `peek()` | `peekFirst()` |

---

## ArrayDeque — The Go-To Implementation

`ArrayDeque` is backed by a circular resizable array and is the preferred `Deque` implementation in most cases:

```java
import java.util.ArrayDeque;
import java.util.Deque;

Deque<String> deque = new ArrayDeque<>();

// Add to both ends
deque.addFirst("Middle");
deque.addFirst("First");
deque.addLast("Last");

System.out.println(deque); // [First, Middle, Last]

// Remove from both ends
System.out.println(deque.pollFirst()); // First
System.out.println(deque.pollLast());  // Last
System.out.println(deque);             // [Middle]
```

---

## ArrayDeque vs LinkedList as Deque

| Feature | `ArrayDeque` | `LinkedList` |
| --- | --- | --- |
| Memory | Compact circular array | Node per element (3 references) |
| Performance (head/tail ops) | Faster (array, better cache) | Slightly slower |
| Null elements | Not allowed | Allowed |
| Implements List | No | Yes |
| Implements Deque | Yes | Yes |
| Random access | No | No (List methods available but O(n)) |
| Thread safety | No | No |

**Use `ArrayDeque` by default.** Only reach for `LinkedList` if you also need `List` methods on the same object, which is uncommon.

---

## Deque as a Stack

The Java documentation explicitly recommends `Deque` over `java.util.Stack`:

```java
Deque<String> stack = new ArrayDeque<>();

stack.push("Alice");
stack.push("Bob");
stack.push("Carol");

System.out.println(stack.peek()); // Carol — top of stack
System.out.println(stack.pop());  // Carol
System.out.println(stack.pop());  // Bob
```

---

## Deque as a Queue

```java
Deque<String> queue = new ArrayDeque<>();

queue.offer("First");
queue.offer("Second");
queue.offer("Third");

System.out.println(queue.peek());  // First
System.out.println(queue.poll());  // First
System.out.println(queue.poll());  // Second
```

---

## Real-World Use Cases

### 1. Sliding Window Maximum (Monotonic Deque)

Find the maximum in each window of size k:

```java
public static int[] maxSlidingWindow(int[] nums, int k) {
    Deque<Integer> dq = new ArrayDeque<>(); // stores indices
    int[] result = new int[nums.length - k + 1];

    for (int i = 0; i < nums.length; i++) {
        // Remove indices outside the window
        while (!dq.isEmpty() && dq.peekFirst() < i - k + 1) {
            dq.pollFirst();
        }
        // Remove indices whose values are smaller than current
        while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i]) {
            dq.pollLast();
        }
        dq.offerLast(i);
        if (i >= k - 1) result[i - k + 1] = nums[dq.peekFirst()];
    }
    return result;
}

System.out.println(Arrays.toString(
    maxSlidingWindow(new int[]{1,3,-1,-3,5,3,6,7}, 3)
)); // [3, 3, 5, 5, 6, 7]
```

### 2. Palindrome Check

```java
public static boolean isPalindrome(String s) {
    Deque<Character> deque = new ArrayDeque<>();
    for (char c : s.toLowerCase().replaceAll("[^a-z0-9]", "").toCharArray()) {
        deque.addLast(c);
    }
    while (deque.size() > 1) {
        if (!deque.pollFirst().equals(deque.pollLast())) return false;
    }
    return true;
}

System.out.println(isPalindrome("A man a plan a canal Panama")); // true
```

### 3. Browser History

```java
Deque<String> backStack  = new ArrayDeque<>();
Deque<String> forwardStack = new ArrayDeque<>();
String current = "home";

void navigate(String url) {
    backStack.push(current);
    forwardStack.clear();
    current = url;
}

void back() {
    if (!backStack.isEmpty()) {
        forwardStack.push(current);
        current = backStack.pop();
    }
}

void forward() {
    if (!forwardStack.isEmpty()) {
        backStack.push(current);
        current = forwardStack.pop();
    }
}
```

---

## Key Takeaways

- `Deque` extends `Queue` with operations at both ends — use it as a stack, queue, or sliding window
- `ArrayDeque` is the best all-around implementation — faster and lighter than `LinkedList`
- `ArrayDeque` does not allow null; `LinkedList` does
- Prefer `Deque` over `Stack` for LIFO use cases
- Prefer `ArrayDeque` over `LinkedList` for FIFO use cases

---

## Navigation

**← Previous:** [PriorityQueue in Java](/java/priorityqueue-in-java)

**Next →** [The Map Interface](/java/map-interface)
