---
title: Expert System
slug: expert-system
kind: technique
category: Foundations and History
aliases: expert systems, rule-based system, knowledge-based system
related: symbolic-ai, ai-winter, artificial-intelligence, machine-learning, connectionism
summary: The commercial flagship of symbolic AI: a program that captured a human specialist's knowledge as thousands of if-then rules and applied them to give expert-level advice in a narrow domain. Its successes built an industry, and its one structural flaw, that experts cannot say what they know, collapsed it.
---

An expert system tries to bottle a human expert. Its design rests on one clean separation: a knowledge base holding what the system knows, typically hundreds or thousands of if-then rules elicited from specialists, and a separate inference engine that applies those rules to the facts of a specific case and chains them toward a conclusion. Split the knowledge from the reasoning that uses it, and you can capture an expert's judgment as editable data while reusing the same engine across domains. That division made the expert system the most successful and by far the most commercialized form of symbolic AI.

For a while it genuinely worked. MYCIN, built at Stanford in the 1970s, diagnosed bacterial infections and recommended antibiotics at a level that tested as comparable to human specialists. DENDRAL inferred molecular structures from mass-spectrometry data. XCON configured computer orders for Digital Equipment Corporation and reportedly saved the company tens of millions of dollars a year. These were not toys, and they set off a commercial boom in the 1980s, complete with dedicated companies, specialized Lisp machines, and a widespread conviction that capturing expertise in rules was a dependable road to useful AI.

The flaw was not in any one system but in the premise. Eliciting an expert's knowledge as explicit rules assumes the expert can state what they know, and the deep finding of the era is that, largely, they cannot. A radiologist or a master mechanic runs on tacit, pattern-trained intuition accumulated over thousands of cases, knowledge that resists being written down as rules, the same gap Michael Polanyi named in "we know more than we can tell." So the rules never quite covered the cases, the systems stayed brittle at the edges of their hand-coded knowledge, they could not learn from experience, and every update demanded an expensive knowledge engineer. This knowledge-acquisition bottleneck scaled terribly.

These weaknesses drove the second AI winter, when the costly expert-system industry collapsed under its maintenance burden and the competition from cheaper general machines. The deeper significance is the turn it forced. An expert system encodes knowledge top-down, by hand, in the symbolic AI tradition; the machine learning that displaced it, and especially the connectionist neural network, learns its knowledge bottom-up from data, sidestepping the very bottleneck that killed the expert system. The shift from hand-built rules to learned models is one of the central pivots in the history of the field, and the expert system stands as the high-water mark of the era the data-driven approach swept away.
