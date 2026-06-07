---
title: QA Testing
slug: qa-testing
kind: tool
category: AI Engineering
aliases: AI testing, automated QA, quality assurance testing
related: evaluation, agent-evaluation, code-generation, automation, agentic-workflow, benchmark
summary: Using AI to test software, generating test cases, exploring an application for bugs, and judging whether behavior is correct, which is appealing because testing is laborious and incomplete by nature. The catch is that an AI tester shares the blind spots of the AI that might have written the code.
---

Testing is the part of software everyone agrees matters and nobody does enough of, because writing tests is tedious and the space of things that can go wrong is effectively infinite. AI looks like the perfect fit: it can generate cases from a specification, drive an application hunting for ways to break it, and judge whether what happened matches what should have. The promise is to absorb exactly the laborious, never-finished work human testers can never fully cover.

It shows up in a few forms. It writes unit and integration tests from code or requirements, covering the routine cases a person skips out of boredom. It does exploratory testing, poking at an application like a curious and slightly malicious user to surface failures no one specified. And increasingly it serves as a judge, ruling on whether an output, a UI state, or an agent's behavior is acceptable when there is no exact answer to compare against, the fuzzy verdict traditional automated tests could never render.

The deep problem is the correlated blind spot. A test is only as good as its idea of what correct means, and when the same kind of model both writes the code and writes the tests, the two tend to share assumptions, so the tests confirm that the code does what the model thought it should rather than what it actually should. The bug the model failed to imagine is precisely the test it failed to write. This is why AI testing is powerful for breadth, generating many cases quickly, and untrustworthy for judgment, deciding what is worth testing, which still needs a human or a genuinely independent source of truth.

QA with AI sharpens a principle that runs through all of applied AI: verification is only as valuable as it is independent, and it loses that value the instant the checker and the checked share a mind. An AI tester that catches an AI coder's mistakes is genuinely useful, but only to the degree their perspectives differ, which is why the trustworthy setups manufacture difference on purpose, a different model, a different prompt, a human on what matters, rather than letting one system both do the work and certify it.
