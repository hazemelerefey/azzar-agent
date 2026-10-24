# Local update testing guide

This directory contains the tools and scripts for testing the Desktop app's update flow locally, including switching between the stable, nightly, and canary channels.

## Directory structure

```
scripts/update-test/
├── README.md                    # This document
├── setup.sh                     # One-click setup script
├── run-test.sh                  # One-click test run (recommended)
├── start-server.sh              # Start the local update server
├── stop-server.sh               # Stop the local update server
├── generate-manifest.sh         # Generate manifests and directory structure
├── dev-app-update.local.yml     # Update config template for local testing
└── server/                      # Local server files (auto-generated)
    ├── stable/                  # stable channel
    │   ├── stable-mac.yml
    │   └── {version}/
    │       ├── xxx.dmg
    │       └── xxx.zip
    ├── nightly/                 # nightly channel
    │   ├── nightly-mac.yml
    │   └── {version}/
    │       └── ...
    └── canary/                  # canary channel
        ├── canary-mac.yml
        └── {version}/
            └── ...
```

## Quick start

### One-click test (recommended)

```bash
cd apps/desktop/scripts/update-test
chmod +x *.sh
./run-test.sh
```

This script automatically generates manifests with different versions per channel, starts the local server, configures the app, and launches the app.

### Manual steps

#### 1. First-time setup

```bash
cd apps/desktop/scripts/update-test
chmod +x *.sh
./setup.sh
```

#### 2. Build the test package

```bash
cd ../..
# Build DMG + ZIP (macOS auto-update requires ZIP)
bun run package:mac:local
```

> **Note**: do not use `package:local`. It only outputs the directory structure and produces no DMG/ZIP installers.

#### 3. Generate the update files

```bash
cd scripts/update-test

# Generate for all channels (recommended, versions are assigned automatically)
./generate-manifest.sh --from-release --all-channels

# Or target a single channel
./generate-manifest.sh --from-release -c nightly -v 2.1.0-nightly.1
```

#### 4. Start the local server

```bash
./start-server.sh
# The server starts on http://localhost:8787 by default
```

#### 5. Launch the app

```bash
cd ../..
UPDATE_SERVER_URL=http://localhost:8787 bun run dev
```

**Important**: you must set the `UPDATE_SERVER_URL` environment variable, otherwise channel switching falls back to GitHub in `configureUpdateProvider()`.

#### 6. Test channel switching

1. Open **Settings > Beta**
2. Pick a different channel in the **Update Channel** dropdown
3. The app automatically checks the new channel for updates
4. Confirm the feed URL switched correctly in the logs: `tail -f ~/Library/Logs/azzar-desktop-dev/main.log`

#### 7. When testing is done

```bash
cd scripts/update-test
./stop-server.sh

# Restore the default dev-app-update.yml (optional)
cd ../..
git checkout dev-app-update.yml
```

---

## generate-manifest.sh usage

```bash
Usage: ./generate-manifest.sh [options]

Options:
  -v, --version VERSION    Specify the version (e.g. 2.0.1)
  -c, --channel CHANNEL    Specify the channel (stable|nightly|canary, default: stable)
  -a, --all-channels       Generate manifests for all channels (stable/nightly/canary)
  -d, --dmg FILE           Specify the DMG filename
  -z, --zip FILE           Specify the ZIP filename
  -n, --notes TEXT         Specify the release notes
  -f, --from-release       Copy files from the release directory automatically
  -h, --help               Show help

Examples:
  ./generate-manifest.sh --from-release --all-channels
  ./generate-manifest.sh -v 2.0.1 -c stable --from-release
  ./generate-manifest.sh -v 2.1.0-nightly.1 -c nightly --from-release
```

---

## Test scenarios

| Scenario                      | Steps                                                              |
| ----------------------------- | ------------------------------------------------------------------ |
| New version available         | Manifest `version` is higher than the current app version          |
| No new version                | `version` is lower than or equal to the current version            |
| Channel switch (upgrade)      | Switch from Stable to Nightly/Canary, a higher version is found   |
| Channel switch (downgrade)    | Switch from Canary to Stable, `allowDowngrade` is set to true      |
| Download failure              | Delete the DMG file in server/{channel}/{version}/                 |
| Network error                 | Stop the local server                                              |
| Manifest missing              | Delete the corresponding {channel}-mac.yml                        |

---

## macOS signature verification

### Gatekeeper

Locally built packages are unsigned and unnotarized, so macOS blocks them from running. Workarounds:

```bash
# Temporarily disable Gatekeeper (recommended; re-enable it when done testing)
sudo spctl --master-disable

# When finished
sudo spctl --master-enable
```

Or remove the quarantine attribute manually:

```bash
xattr -cr /path/to/YourApp.app
```

### Squirrel.Mac update installation limits

**Locally built unsigned packages cannot complete the update installation step.** Squirrel.Mac requires the update package's signature to match the running app's designated requirement. An ad-hoc signature's DR contains the `cdhash` (binary hash), which differs between builds, so the check always fails.

This means local testing verifies up to **download complete**, but not installation. CI uses a real Apple Developer certificate, so this limitation does not apply there.

**What can be verified (via logs):**

```bash
tail -f ~/Library/Logs/azzar-desktop-dev/main.log | grep -E 'Switching|Configuring|channel|checking'
```

- Channel switch: `Switching update channel: stable -> canary`
- Feed URL switch: `Configuring generic provider for canary channel`
- Manifest match: `Channel set to: canary (will look for canary-mac.yml)`
- Update detection: `Update available: x.y.z` or `Update not available`

---

## Troubleshooting

### 1. Still requesting the old channel after switching

- Confirm the app was launched with `UPDATE_SERVER_URL=http://localhost:8787`
- Confirm `configureUpdateProvider` was called in the logs: `grep 'Configuring generic' ~/Library/Logs/azzar-desktop-dev/main.log`

### 2. Update not detected

- Confirm the channel's manifest exists: `curl http://localhost:8787/stable/stable-mac.yml`
- Confirm the manifest version is higher than the current version

### 3. Server fails to start

```bash
# Check whether the port is taken
lsof -i :8787

# Use a different port
PORT=9000 ./start-server.sh
```

---

## Notes

**Security reminders**:

1. Re-enable Gatekeeper when testing is done
2. These scripts are for local development testing only
3. Do not distribute unsigned packages to other users
