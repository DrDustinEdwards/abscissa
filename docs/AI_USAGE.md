# AI usage record

The Journal of Open Source Software asks authors to disclose the use of
generative AI in the software and the paper. This is Abscissa's record. It is
updated whenever AI tools are used on the project.

## Tools and models

| Tool | Model | Period |
|---|---|---|
| Claude Code (Anthropic's command-line coding agent) | Claude Opus, an Anthropic large language model | From 2026-09-28 |

## Who did what

**Dustin Edwards (human author)** defined the project: the problem, its
audiences and the requirements, in a written brief dated 2026-09-28. The brief
set the purpose (one shared, accessible, server-rendered charts package for
his sites, and research software for scientific figures), the technical
foundation (Observable Plot on the server, D3 for networks), the chart types
and the order of the scientific ones, the enhancement layer's features, the
theming and color-checking requirements, the quality bar (strict TypeScript,
the test suites, documentation, open-source hygiene, JOSS readiness), the
licensing, and the instruction not to migrate existing sites yet. The design
records mark these as "author's decisions". He reviews the code and the
records before release, and has the first version reviewed independently
before the repository is made public.

**Claude Opus, via Claude Code**, working from that brief:

- audited the chart code of the five existing sites and summarized it;
- proposed the implementation choices recorded in `docs/design/` as
  "implementation choices" (for example, returning HTML strings, fixed-size
  palettes, CSS custom properties with `light-dark()`, the keyboard model);
- wrote the source code in `src/`, the tests in `test/`, the examples, the
  gallery and screenshot scripts, the CI workflows, and the first drafts of
  the documentation, the design records, this record and the paper;
- ran the tests, audits and builds and fixed what they found.

## How AI output was checked

- Statistics and color formulas are tested against independently published
  values where they exist (WCAG contrast examples, Student's t tables, the
  CIEDE2000 test data of Sharma, Wu and Dalal), and otherwise against
  properties the model must have (grays unchanged by color vision
  simulation), not only against the implementation's own output.
- Accessibility is checked by axe-core in a real browser, not asserted.
- Rendered output is stored and reviewed as a diff when it changes.
- The human author reviews all changes before release, and the first version
  is reviewed independently before publication.

## What was not done with AI

No data in the examples or tests is presented as real measurement: example
datasets are labelled "Illustrative data" in their captions, and the genome
example cites its reference sequence.
