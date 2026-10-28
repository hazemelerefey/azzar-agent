# AZZAR approved brand assets

Branch: brand/approved-assets. Base: see git log. This branch is for Antigravity to pull assets from GitHub, not a merge to master on its own.

Source of truth: brand/azzar-brand-pack-and-avatars-updated/ (134 files, approved updated pack, no-ring orchestrator, no agent-default, no sheets, no smooth/Grok/diamond drafts). Agent-default-v2 is in brand/agent-default-v2.png, kept separately because it is excluded from the pack.

Superseded, do NOT use: old public-replacements/azzar-avatars.zip, v1 azzar-ai.png, v1 agent-default.png, ring orchestrator, sheets.

Public replacements in this branch, with SHA256 prefix:

- public/avatars/azzar-ai.png : ec9965ed0efb6c81 : approved pack orchestrator dark, no-ring
- public/avatars/agent-default.png : ab27b7cca7d839c3 : agent-default-v2, approved separately, excluded from pack
- public/avatars/agent-builder.png : 7075e826d8da830a : prepared v1 builder, 512x512
- public/avatars/doc-copilot.png : 9872b92552743f4e : prepared v1 doc-copilot, 512x512
- public/og/og.webp : 1cb96db87fb0991b : prepared v1, 1280x720
- public/og/agent-og.webp : a5bff293b450bbb5 : prepared v1, 1280x720
- public/og/mcp-og.webp : 2224fdb78cab0216 : prepared v1, 1280x720

Screenshots override, from HAZEM 2026-10-27: do NOT wait for real app captures for this round. Use what was prepared. Antigravity: use the approved pack images in brand/ as source for screenshot placeholders, do not leave Lobe screenshots in place, and report the placeholder files for HAZEM review. Real app captures can replace them later if HAZEM directs.

Banners: no exact-dimension prepared banner files were pushed in public/static/app-images/. Antigravity: generate banner replacements at exact repo dimensions from the approved pack logo and colors, for review, do not copy wrong-size pack banners blindly.

Antigravity next: pull this branch, verify files above by hash, use them for binary replacement work, report back, do not merge to master on your own.
