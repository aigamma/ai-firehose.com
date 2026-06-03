---
title: CUDA
slug: cuda
kind: tool
category: Systems and Infrastructure
aliases: compute unified device architecture, CUDA kernels
related: gpu, flops, memory-bandwidth, flash-attention, matrix-multiplication, mixed-precision-training
summary: CUDA is the parallel programming platform and software stack that lets developers run general-purpose computation on a particular vendor's GPUs, and it is the foundation almost every deep learning framework builds on to turn neural network operations into fast GPU code.
---

CUDA is the software layer that makes a gpu usable for general computation rather than only graphics. It provides a programming model in which a developer writes a small function, called a kernel, that runs simultaneously across thousands of GPU threads, plus the libraries, compiler, and drivers that map that code onto the hardware's cores and memory. It is proprietary to one dominant GPU vendor, and its maturity and breadth are a large part of why that vendor's hardware became the default for machine learning.

CUDA matters because deep learning frameworks do not talk to the GPU directly; they call into CUDA and its companion libraries. When a framework executes a matrix-multiplication, a convolution, or an attention operation, it is dispatching a tuned CUDA kernel underneath, often from vendor libraries that have been hand-optimized to extract close to the chip's peak flops. This means the practical performance of training and inference depends heavily on the quality of these kernels, and that a hardware platform without a comparable software stack is hard to adopt no matter how good its raw silicon is. This software lock-in is often called the CUDA moat.

The programming model exposes the GPU's structure so that performance-minded code can exploit it. Threads are grouped into blocks that share a small, fast on-chip memory and can cooperate, while the large but slower main memory holds the bulk of the data. Writing fast CUDA is largely about respecting this hierarchy: keeping the arithmetic units busy, moving data in large contiguous transfers, and reusing values in fast memory to avoid being limited by memory-bandwidth. The most important efficiency wins in deep learning, such as flash-attention, are essentially clever CUDA kernels that restructure a computation to keep data in fast memory instead of repeatedly reading and writing slow memory.

For most practitioners CUDA is invisible, hidden behind the high-level framework, and that is the point: it lets them express a model in a few lines while the heavy lifting runs as compiled GPU code. It becomes visible when squeezing out performance, writing a custom kernel for an operation the framework handles poorly, or enabling the low-precision paths used in mixed-precision-training. Because CUDA is the gateway to GPU compute, the cost and feasibility of the large training runs described by the scaling-laws ride on how efficiently these kernels turn hardware flops into useful model work.
