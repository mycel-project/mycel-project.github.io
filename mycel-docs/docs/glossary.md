# Glossary

This project draws heavily from the work of Piotr Wozniak and [SuperMemo](https://www.super-memory.com/). Where concepts overlap, links to the SuperMemo wiki are provided for reference, though definitions may diverge. 

## Node types
- **Fragment** — Node containing learning material to be recursively broken down, with the goal of extracting all content worth retaining into spores. Transitional nodes meant to be dismissed once their content has been fully extracted. ([Topic](https://supermemo.guru/wiki/Topic) in SM)
- **Spore** — Node containing small, testable units of knowledge, designed to be retained long-term. Permanent elements of the collection. ([Item](https://supermemopedia.com/wiki/Item) in SM)
- **Extract** — child node (fragment/spore) created from a portion of a parent node.

## Scheduling

- **Priority** — A value (0–100%) representing the importance assigned to a node. Every node has a priority. Lower values indicate higher priority (0% = least important, 100% = most important). ([Priority](https://supermemopedia.com/wiki/Priority) in SM). Note: unlike SuperMemo, where 0% means highest priority, Mycel uses the inverse convention: 100% is highest priority. 
- **Overdue** — A node whose due date has passed without being reviewed.

## Tree terminology
- **Parent** — node from which an extract was made
- **Child** — extracted node
- **Root** — topmost ancestor of a nested chain
- **Depth** — number of levels from the root (root = 0)
