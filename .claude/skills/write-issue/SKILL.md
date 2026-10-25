---
name: write-issue
description: Grill the user about a concept until the smallest shippable v1 is clear, then write it as Linear issues. Use when planning work, splitting a project into issues, or writing or editing a Linear issue.
---

# Write issue

Goal: the smallest v1 that ships and is useful. Everything else goes to "Later".

Do not write the issue until the user has confirmed the v1 summary.

## 1. Grill

Ask 1-3 sharp questions per round, using AskUserQuestion when the options are
clear. Check the codebase and existing Linear issues first; never ask what they
already answer. Keep going until every question below has a concrete answer.

- **Problem:** What hurts today, and for whom? What do they do instead now?
- **Outcome:** After v1 ships, what can someone do that they couldn't before?
  One sentence.
- **Proof:** How will we know it works? (A row in prod, a page that loads, a
  founder doing X once.)
- **Cut test:** For each piece mentioned: "Can v1 ship without this?" If yes,
  it goes to Later.
- **Manual first:** Can a person do it by hand, in the DB, or by config for now
  instead of building UI or automation?
- **Reuse:** What existing code, data, or defaults can v1 lean on?
- **Must not break:** Which existing flows need to keep working?

Push back on vague or growing answers. Suggest the smaller version
("What if v1 only…?") and let the user decide.

## 2. Confirm

Play back, briefly:

- **v1:** the outcome and the concrete changes
- **Later:** everything that was cut

Get an explicit yes before writing.

## 3. Write

- One outcome per issue. If the title needs "and", split it.
- Name the concrete artifacts: tables, columns, models, routes, pages.
- No speculative fields, helpers, relations, or config "for later".
- Set blocking relations when one issue needs another merged first.
- Put Later items in "Out of scope", or offer to create them as Backlog issues.

```md
<One or two sentences: what changes and why.>

## Scope

* <concrete change>

## Out of scope

* <cut item, deferred>

## Done when

* <observable result>
```

Skip "Done when" if it only repeats the scope.
