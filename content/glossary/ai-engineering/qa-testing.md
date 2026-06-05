---
title: QA Testing
slug: qa-testing
kind: tool
category: AI Engineering
aliases: AI testing, automated QA, quality assurance testing
related: evaluation, agent-evaluation, code-generation, automation, agentic-workflow, benchmark
summary: Using AI to test software, generating test cases, exploring an application for bugs, and judging whether behavior is correct, which is appealing because testing is laborious and incomplete by nature. The catch is that an AI tester shares the blind spots of the AI that might have written the code.
---

Testing is the part of software everyone agrees matters and no one does enough of, because writing tests is tedious and the space of things that could go wrong is effectively infinite. AI is an obvious fit: it can generate test cases from a specification, click around an application hunting for ways to break it, and judge whether what happened matches what should have. The promise is to relieve exactly the laborious, never-finished work that human testers cannot fully cover.

AI testing shows up in a few forms. It generates unit and integration tests from code or requirements, covering the routine cases a human would skip out of boredom. It does exploratory testing, driving an application like a curious user to surface unexpected failures. And increasingly it acts as a judge, deciding whether an output, a UI state, or an agent's behavior is acceptable when there is no exact answer to compare against, the kind of fuzzy verdict automated tests traditionally could not make.

The deep problem is the correlated blind spot. A test is only as good as its notion of what correct means, and if the same kind of model both wrote the code and wrote the tests, they tend to share assumptions, so the tests confirm the code does what the model thought it should rather than what it actually should. The bug the model did not think of is also the test it did not write. This is why AI testing is powerful for breadth, generating many cases fast, but cannot be trusted alone for the judgment of what to test, which still needs a human or an independent source of truth.

QA testing with AI sharpens a principle that runs through all of applied AI: the value is in independent verification, and verification loses its value the moment it stops being independent. An AI tester that catches the mistakes of an AI coder is genuinely useful, but only to the degree their perspectives differ, which is why the trustworthy setups deliberately diversify, a different model, a different prompt, a human in the loop on what matters, rather than letting one system both produce the work and certify it.
