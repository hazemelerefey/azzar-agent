# AZZAR Agent — GitHub Repo Launch Plan

## Repo
- Name: `azzar-agent`
- Owner: hazemelerefey
- Visibility: public (flagship product, proprietary LICENSE)
- Source: push entire `~/workspace/azar` as-is (7,785 files, 82 commits)

## Structure (added at root)
- `README.md` — the star. World-class, brand-driven.
- `LICENSE` — proprietary (his).
- `docs/` — architecture overview + deep-dives (existing deep-dives stay).
- `docs/assets/` — README media (logo PNG, header banner).
- `.github/workflows/audit.yml` — CI running brand sweep + syntax check on push.

## README design
- **Hero**: AZZAR logo (PNG from brand pack) + one-line tagline, badges (license, version, packages).
- **Voice**: human, confident, AZZAR tone. No AI slop, no em dashes.
- **Sections**:
  1. Hero (logo, tagline, badges)
  2. What is AZZAR (one paragraph)
  3. Architecture (diagram — generate, OLED black + Aurum)
  4. Packages (`@azzar/*` table with one-line descriptions)
  5. Quick start (clone, install, run)
  6. The cost rule (you only pay for the LLM API — his differentiator)
  7. Brand (colors, logo, guidelines link)
  8. License
- **Design rules**: his blacklist applies (no gradients, no glow, no glassmorphism, no emoji icons, one accent color Aurum #F6D27F on black).
- **Skills**: local-taste-skill (art direction), local-impeccable (execution), local-hallmark (final audit), local-humanizer + local-no-ai-slop (copy).

## Steps
1. Create repo via GitHub connector. [me]
2. Subagent builds README package (README.md + media + docs/assets + workflow). [subagent]
3. I review the README myself before it ships (delivery discipline). [me]
4. Commit, push, verify with fresh clone. [me]
5. Report to HAZEM with repo link.
