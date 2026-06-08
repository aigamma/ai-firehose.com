---
title: Model Routing
slug: model-routing
kind: technique
category: AI Engineering
aliases: model router, LLM routing, request routing
related: multi-model-workflow, model-agnostic, openrouter, large-language-model, frontier-model, token-optimization
summary: Sending each request to the model best suited to it, a small fast model for easy queries and a large expensive one for hard ones, instead of paying frontier prices for every call. It treats the model not as a fixed choice but as a dispatch decision made per request, one of the most direct levers on the cost and latency of an LLM product.
---

Most LLM products send every request to one model, usually the strongest, because that is the safe default. But the strongest model is also the slowest and dearest, and the great bulk of real traffic, classification, extraction, short rewrites, simple answers, does not need it. Model routing is the decision to stop paying frontier prices for trivial work: look at each request and dispatch it to the cheapest model that will still get it right.

A router is a classifier sitting in front of the models, and the design choices are what it routes on and how it decides. It can route on the task, sending a known cheap operation to a small model; on an estimate of difficulty, where a quick model or a learned scorer judges whether the query is hard; or on a budget the caller sets explicitly. The hard part is the cost of being wrong: route a hard query to a weak model and you get a confident bad answer, so routers are tuned to escalate to the strong model whenever the difficulty signal is uncertain.

The reason routing pays is an asymmetry in the traffic. Cost is dominated by the few hard queries that genuinely need the big model, while volume is dominated by the many easy ones that do not, so moving even a large share of requests onto a small model barely dents quality while cutting the bill sharply. Routing converts a flat per-call price into a distribution matched to the actual difficulty of the work, which is precisely why the savings grow with scale.

Routing is where model-agnostic design pays off concretely, since a router can only dispatch among models it can swap freely. It also blurs the line between a model and a system: a well-routed product behaves like one capable assistant while being, underneath, a portfolio of models each handling the slice it is best at. As the frontier fans out into many models at many price points, the routing layer, not any single model, increasingly decides whether a product is both good and affordable.
