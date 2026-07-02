> **This section is in active building and is not complete at the moment.**

# Implement Mycel

This page describes how to create a Mycel implementation in existing tools and applications such as PKM tools, text editors, services, ... (even video games, where utility meets enjoyment!).
Rather than a linear guide, this document outlines essential concepts and implementation details.

**Please note that the Mycel API is not stable at the moment and that things can evolve quickly, introducing frequent breaking changes. If you want to start an implementation now, please keep in mind that it may require significant maintenance effort.**

## Before you start

- From now on, the term **environment** refers to the tool of your choice in which you want to bring Mycel to life.

- We strongly recommend being familiar with your environment, both as a regular user (to understand what makes a good tool) and as a developer, as language-specific details are out of scope here.

- Prior experience with Mycelium (or another complete Mycel implementation) is highly beneficial for understanding the expected implementation patterns and the core principles of Spaced Repetition.

- Try to stick as much as possible to classical and standard ways of integrating your implementation with Mycel features. The more standard it is, the easier it will be to handle updates and breaking changes (and especially to avoid requiring changes unless Mycel explicitly introduces a breaking change).

- You can check whether a Mycel implementation already exists in your language of choice on the [Awesome Mycel repository](https://github.com/mycel-project/awesome-mycel) repository. It could be a source of inspiration or a place to reuse code from.

- While it is possible to develop your implementation using MycelCloud, it is highly recommended to use a [self-hosted](https://mycel-project.com/mycel#self-hosting) instance of Mycel to have full control over the infrastructure and access complete logs.

- Feel free to check the [Mycelium](https://github.com/mycel-project/mycelium) repository to see how certain things are implemented. Some sections in this document will point directly to this repo, but please note that these are just suggestions. There are often other, or even better, ways to handle this depending on your skill level and programming language.

For any question or suggestion, feel free to ask (on Mycel repository, on project's reddit, ...)!

## Prerequisites

First, some conditions must be checked by your environment to allow implementing.

### Required

- A way to communicate with external REST APIs.

### Recommended

- A Markdown viewer/editor as Mycel is, at the moment, Markdown-only. (If you see value in extending beyond it, don't hesitate to bring it up. This behavior could be changed without modifying everything, so it's open for discussion.)
- A text/file caching system.
