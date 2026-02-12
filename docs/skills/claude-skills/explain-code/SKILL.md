---
name: explain-code
description: Explains code with visual diagrams and analogies. Use when explaining how code works, teaching about a codebase, answering "how does this work?", or when someone needs to understand complex logic, architecture, or data flow.
---

# Code Explanation Guide

When explaining code, always include these four elements:

## 1. Analogy First
Start with an everyday analogy that captures the core concept:
- Compare data structures to physical objects
- Compare algorithms to real-world processes
- Compare architecture to familiar systems (restaurants, factories, post offices)

## 2. ASCII Diagram
Create a visual representation showing:

**For data flow:**
```
[Input] --> [Process A] --> [Process B] --> [Output]
              |                  ^
              v                  |
         [Side Effect] ---------|
```

**For architecture:**
```
┌─────────────┐     ┌─────────────┐
│   Client    │────>│   Server    │
└─────────────┘     └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Database   │
                    └─────────────┘
```

**For state machines:**
```
[Idle] ---(click)---> [Loading] ---(success)---> [Ready]
                          |
                      (error)
                          |
                          v
                       [Error]
```

## 3. Step-by-Step Walkthrough
Walk through the code execution:
1. Entry point and initial state
2. Each transformation or decision
3. How data changes at each step
4. Final output or side effects

## 4. Gotcha / Common Mistake
Highlight one non-obvious detail:
- Edge cases that break assumptions
- Performance implications
- Common misunderstandings
- Why it's done this way (not another)

## Style Guidelines

- Keep explanations conversational
- For complex concepts, use multiple analogies
- Scale diagram complexity to code complexity
- Use consistent visual conventions (boxes for components, arrows for flow)
- When explaining recursion, show the call stack visually
