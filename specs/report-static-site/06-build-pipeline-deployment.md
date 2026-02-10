# Spec 06: Build Pipeline & Deployment

## Goal
Automate the build process and deploy the static site to Cloudflare Pages with a working domain.

## Context
- Prototyping (Specs 02–05) will clarify how content is sourced and what the build needs to do
- Current decision: simple Node build script with `marked`/`markdown-it`, fetch markdown from GitHub at build time
- This may change based on prototyping learnings

## Slices

TBD — to be defined after prototyping is complete. Decisions that feed into this spec:

- **Content sourcing**: Does the build pull from `meaningfool-writing` GitHub raw URL? Or has the content been manually adapted into HTML during prototyping?
- **Templating**: What does the build script need to produce? Just inject markdown into a template? Or are there custom HTML sections that don't come from markdown?
- **Domain**: Subdomain (`report.meaningfool.net`) vs. standalone domain
- **Rebuild triggers**: Manual only? Or webhook from `meaningfool-writing`?

### Likely slices (subject to change):
1. Node project setup (`package.json`, build script)
2. Markdown fetch & conversion
3. Template injection & file output
4. GitHub Actions workflow
5. Cloudflare Pages deployment
6. Domain configuration

## Shared Components Impacted
- TBD

## Pre-existing Tests Impacted
- None
