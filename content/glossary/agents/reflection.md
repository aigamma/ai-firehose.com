---
title: Reflection
slug: reflection
kind: technique
category: Agents and Tool Use
aliases: self-reflection, self-critique
related: ai-agent, react-prompting, planning, agent-memory, agentic-workflow, autonomous-agent, multi-agent-system
summary: A pattern in which an agent examines its own output or reasoning, critiques it, and uses that critique to revise and improve, rather than accepting its first attempt as final.
---

Reflection is the practice of having an agent inspect and judge its own work before treating it as done. Instead of accepting a model's first response, a reflection step prompts the model (or a second model) to review that response against the goal and any constraints, identify flaws, and produce a critique. The critique then feeds a revision: the agent tries again, informed by what it found wrong the first time. The cycle of generate, critique, revise can repeat until the work passes review or a limit is reached. In effect, reflection adds a self-correcting loop on top of a single pass of generation.

Reflection matters because a model's first attempt is often not its best. Many mistakes that a model cannot avoid while generating, a skipped requirement, a logical gap, a bug, an unsupported claim, it can readily spot when asked afterward to evaluate the result critically. Separating the act of producing from the act of judging tends to surface problems that inline generation glosses over, much as a writer catches errors on a second read that they missed while drafting. This is one of the most dependable ways to lift the quality and reliability of agent output without changing the underlying model.

In practice, reflection takes a few forms. The simplest asks the same model to critique its own answer and then rewrite it. A stronger variant uses grounded feedback: the agent runs the code and reflects on the actual error message, or checks a claim against a retrieved source, so the critique is anchored in real evidence rather than the model's unaided opinion. In a multi-agent-system, reflection is often split across roles, with a dedicated critic agent reviewing a generator agent's work, which avoids the blind spots of a model grading itself. Storing the lessons of each critique in agent-memory lets an agent carry improvements forward instead of relearning them each time.

Reflection is a building block of capable agents and a standard component of mature agentic-workflow designs, where an evaluator step gates output before it is returned. It strengthens the other core capabilities: it lets planning recover when a plan is going wrong, and it is much of what keeps a long-running autonomous-agent on track, since an agent that can detect and correct its own missteps degrades far more gracefully than one that cannot. The cost is additional model calls and latency, so reflection is applied where the gain in quality justifies the extra work.
