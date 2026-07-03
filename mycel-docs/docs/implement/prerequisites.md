## Before you start

From now on, **environment** refers to the tool you're integrating 
Mycel into, and **client** refers to your Mycel implementation itself.

We **strongly** recommend being familiar with your environment as a 
regular user, to understand what makes a good tool and how Mycel could 
fit naturally into it. This guide often relies on pseudocode rather 
than language-specific examples, so you'll need enough familiarity 
with your environment's language/framework to translate these concepts 
into working code.

!!! tip "Using Mycelium as a reference"
    Prior experience with [Mycelium](https://github.com/mycel-project/mycelium) 
    (or another complete Mycel implementation) helps you understand 
    expected implementation patterns and Spaced Repetition's core 
    principles. This guide sometimes links directly to the Mycelium 
    repo as a reference — but treat these as suggestions, not the only 
    way to do things.

**Useful resources before you dive in:**

- Check [Awesome Mycel](https://github.com/mycel-project/awesome-mycel) 
  to see if an implementation already exists in your language — a great 
  source of inspiration or reusable code.
- Prefer a [self-hosted](https://mycel-project.com/mycel#self-hosting) 
  instance over MycelCloud for full control over infrastructure and logs.
- Refer to the [API Reference](../api/index.md) whenever you're unsure 
  or need more detail — it's a great resource for specific technical 
  details. We recommend using the Scalar version.

Questions or suggestions? Reach out on the [Mycel repository](https://github.com/mycel-project/mycel) or the project's [subreddit](https://www.reddit.com/r/MycelProject/).

## Technical requirements

Before implementing, make sure your environment supports the following

### Required

- A way to communicate with REST APIs — Mycel's interface is exposed as a REST API.

### Recommended

- A Markdown viewer/editor as Mycel is, at the moment, Markdown-only. (If you see value in extending beyond it, don't hesitate to bring it up. This behavior could be changed without modifying everything, so it's open for discussion.)
- A text/file caching system, to avoid redundant API calls and speed up your client.
