# AZZAR Binary Brand Assets Specification

**Branch:** `brand/binary-assets-spec`  
**Base Commit:** `82bddf0b28b2ffee27a8d62561860acb2cc0da63`  
**Purpose:** Specification for rebranding binary assets from upstream LobeChat to AZZAR.  
**Constraint:** Spec only — NO fake or synthetic assets. Graphics must be provided or captured directly from the live AZZAR application.

---

## 1. Pending Assets Overview (20 Upstream Binaries + 1 Flagged Avatar)

The following 20 binary assets in `public/` are byte-for-byte identical (SHA256 match) with upstream LobeChat binaries and require replacement:
- **3 OpenGraph Social Cards** (WebP, 1280x720)
- **3 Default Agent Avatars** (PNG, 512x512, transparent)
- **10 Application Screenshots** (PNG, 5 desktop 1280x676, 5 mobile 640x1138) — **Awaiting real app captures only**
- **4 Static Banners & Footers** (WebP/PNG, modal and community graphics)

Additionally, 1 avatar asset (`public/avatars/azzar-ai.png`) is flagged for visual review by HAZEM.

---

## 2. OpenGraph Social Cards (3 files)

These graphics are served when links to AZZAR are shared on social media (Twitter/X, Discord, Slack, LinkedIn, WhatsApp).

### 2.1 `public/og/og.webp`
- **Current Upstream File:** Size: `67,538 bytes`, Dims: `1280x720` WebP. Shows "Agent teammates that grow with you" with large "LobeHub" logo and 3D floating avatars over LobeChat interface.
- **Specification:**
  - **Filename:** `public/og/og.webp`
  - **Dimensions:** `1280x720` (16:9 standard OpenGraph ratio)
  - **Format:** WebP (lossless or high-quality ~85-90%)
  - **Target Size:** `< 120 KB`
  - **Required Visual Content:**
    - AZZAR Primary Brand Lockup (Wordmark + segmented "Z" mark with emerald green dot `#00E599`).
    - Headline: *"AZZAR · Autonomous Multi-Agent Workspace"* or *"Agent teammates that grow with you"*.
    - Background: Sleek dark canvas (`#0A0A0A` / `#141414`) featuring authentic AZZAR workspace preview or 3D brand geometry. Zero Lobe branding.

### 2.2 `public/og/agent-og.webp`
- **Current Upstream File:** Size: `78,618 bytes`, Dims: `1280x720` WebP. Shows "Agent Marketplace" + "LobeHub" logo with shocked orange blob over Lobe catalog.
- **Specification:**
  - **Filename:** `public/og/agent-og.webp`
  - **Dimensions:** `1280x720` WebP
  - **Target Size:** `< 120 KB`
  - **Required Visual Content:**
    - AZZAR Brand Lockup in corner.
    - Headline: *"AZZAR Agent Marketplace"*.
    - Background: Preview of AZZAR agent cards / templates grid.

### 2.3 `public/og/mcp-og.webp`
- **Current Upstream File:** Size: `97,382 bytes`, Dims: `1280x720` WebP. Shows "MCP Marketplace" + "LobeHub" logo with character holding MCP block.
- **Specification:**
  - **Filename:** `public/og/mcp-og.webp`
  - **Dimensions:** `1280x720` WebP
  - **Target Size:** `< 120 KB`
  - **Required Visual Content:**
    - AZZAR Brand Lockup.
    - Headline: *"Model Context Protocol · AZZAR Tool Runtime"*.
    - Visuals: Official Model Context Protocol emblem combined with AZZAR tool connectors.

---

## 3. Default Agent Avatars (3 files) + Flagged Review (1 file)

Avatars are rendered in agent profile headers, sidebar threads, island cards, and conversation bubbles.

### 3.1 `public/avatars/agent-builder.png`
- **Dimensions:** `512x512` PNG, transparent background.
- **Current Upstream File:** Size: `50,131 bytes`. 3D orange face with yellow construction helmet and colored spheres.
- **Required AZZAR Content:** AZZAR Agent Builder identity (stylized architect, engineering compass, or modern geometric builder mascot in AZZAR black/charcoal/mint-green theme).

### 3.2 `public/avatars/agent-default.png`
- **Dimensions:** `512x512` PNG, transparent background.
- **Current Upstream File:** Size: `30,335 bytes`. 3D clay robot head with pill eyes and L-antenna.
- **Required AZZAR Content:** Default neutral subagent fallback avatar (clean modern robot/agent in silver/charcoal with mint green status indicator).

### 3.3 `public/avatars/doc-copilot.png`
- **Dimensions:** `512x512` PNG, transparent background.
- **Current Upstream File:** Size: `48,839 bytes`. 3D orange face wearing graduation mortarboard.
- **Required AZZAR Content:** Knowledge / Document Copilot identity (stylized notebook/research/scholar motif conforming to AZZAR aesthetic).

### ⚠️ 3.4 Visual Review Flag: `public/avatars/azzar-ai.png`
- **Dimensions:** `512x512` PNG, transparent background.
- **Current File:** Size: `41,258 bytes`. Depicts a bowl-shaped orange-peach gradient head with open happy mouth, pink tongue out, round eyes, and a mushroom-cloud explosion with purple/blue nebula puffs and floating orbs.
- **Status:** **PENDING VISUAL REVIEW BY HAZEM.**
  - *Observation:* Although the filename is `azzar-ai.png` and its hash differs from upstream, the character's visual anatomy closely matches LobeChat's blob mascot family.
  - *Action Needed:* HAZEM must confirm whether this graphic is an approved AZZAR mascot or a legacy Lobe-derived asset requiring replacement with an approved AZZAR brand avatar.

---

## 4. Application Screenshots (10 files) — Real App Captures Only

> [!IMPORTANT]
> **Strict Mandate:** Antigravity will NOT generate synthetic, rendered, or fake UI mockups. All 10 screenshots must be captured directly from the live, fully-styled AZZAR application (desktop and mobile viewports) once UI styling and typography updates are merged.

### 4.1 Desktop Screenshots (5 files)
- **Dimensions:** `1280x676` PNG (24-bit RGB, unscaled)
- **Target Location:** `public/screenshots/shot-{1..5}.desktop.png`
- **View Specifications:**
  1. `shot-1.desktop.png`: Multi-Agent Conversation view with active agent thread, rich markdown formatting, and model selector.
  2. `shot-2.desktop.png`: Agent Studio / Configuration panel showing prompt editor, tool assignments, and parameters.
  3. `shot-3.desktop.png`: Agent Island / Marketplace view showing discoverable agent cards and categories.
  4. `shot-4.desktop.png`: Analytics & Usage Statistics dashboard showing live 320px recharts usage trends and token metrics.
  5. `shot-5.desktop.png`: Tool & MCP Integration view showing active servers, built-in tools, and connection status.

### 4.2 Mobile Screenshots (5 files)
- **Dimensions:** `640x1138` PNG (9:16 mobile viewport)
- **Target Location:** `public/screenshots/shot-{1..5}.mobile.png`
- **View Specifications:**
  1. `shot-1.mobile.png`: Mobile Chat interface with input dock and conversation history.
  2. `shot-2.mobile.png`: Mobile Agent Drawer / Sidebar with agent listing.
  3. `shot-3.mobile.png`: Mobile Marketplace / Discovery view.
  4. `shot-4.mobile.png`: Mobile Agent Settings view.
  5. `shot-5.mobile.png`: Mobile Workspace Navigation & Profile drawer.

---

## 5. Static Banners & Footers (4 files)

These graphics support marketing surfaces, in-app modals, and community landing areas:

| Filename | Format | Dimensions | Current Upstream Visual | Required AZZAR Visual |
|---|---|:---:|---|---|
| `public/static/app-images/banner_creator.png` | PNG | `750x270` | Gold 3D trophy with doodle stickers | Creator incentive modal banner with AZZAR styling |
| `public/static/app-images/banner_market_modal.webp` | WebP | `1602x602` | "Agent Markket" with Lobe UI preview | "AZZAR Agent Market" modal hero with AZZAR discovery UI |
| `public/static/app-images/community_footer_dark.webp` | WebP | `1024x620` | Abstract 3D neon rods (blue, white, pink) | Dark community footer with AZZAR geometric lines & green accent |
| `public/static/app-images/community_header_dark.webp` | WebP | `1024x620` | Abstract 3D neon rods (orange, white, blue) | Dark community header with AZZAR geometric lines & green accent |

---

## 6. Execution Workflow for Asset Replacement

When graphic assets are supplied by HAZEM:
1. Place assets into the appropriate directories matching the exact filenames and dimensions in this specification.
2. Verify image formats, dimensions, and file integrity via automated inspection scripts.
3. Commit all assets in a single, dedicated brand commit on `brand/binary-assets-spec` (e.g., `:art: chore(brand): replace upstream binary assets with authentic AZZAR graphics`).
4. Re-verify production build and test suites prior to merge.
