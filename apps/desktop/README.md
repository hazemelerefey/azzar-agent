# AZZAR Desktop Application

AZZAR Desktop is a cross-platform desktop application for [AZZAR](https://github.com/hazemelerefey/azzar-agent), built with Electron, providing a more native desktop experience and functionality.

## Features

- **Cross-platform support**: macOS (Intel/Apple Silicon), Windows, and Linux
- **Auto updates**: built-in update mechanism keeps you on the latest version
- **Multi-language support**: complete i18n support for 18+ languages with lazy loading
- **Native integration**: deep OS integration with native menus, shortcuts, and notifications
- **Secure and reliable**: macOS notarized, encrypted token storage, secure OAuth flow
- **Multiple release channels**: stable, beta, and nightly builds
- **Advanced window management**: multi-window architecture with theme synchronization
- **Remote server sync**: secure data synchronization with remote AZZAR instances
- **Developer tools**: built-in development panel and debugging tools

## Development setup

### Prerequisites

- **Node.js** 22+
- **pnpm** 10+
- **Electron** compatible development environment

### Quick start

```bash
# Install dependencies
pnpm install-isolated

# Start development server
pnpm dev

# Type checking
pnpm type-check

# Run tests
pnpm test
```

### Environment configuration

Copy `.env.desktop` to `.env` and configure as needed:

```bash
cp .env.desktop .env
```

> [!WARNING]
> Back up your `.env` file before making changes to avoid losing configurations.

### Build commands

| Command                    | Description                              |
| -------------------------- | ---------------------------------------- |
| `pnpm build:main`          | Build main/preload (dist output only)    |
| `pnpm package:mac`         | Package for macOS (Intel + Apple Silicon)|
| `pnpm package:win`         | Package for Windows                      |
| `pnpm package:linux`       | Package for Linux                        |
| `pnpm package:local`       | Local packaging build (no ASAR)          |
| `pnpm package:local:reuse` | Local packaging build reusing existing dist |

### Development workflow

```bash
# 1. Development
pnpm dev # Start with hot reload

# 2. Code Quality
pnpm lint       # ESLint checking
pnpm format     # Prettier formatting
pnpm type-check # TypeScript validation

# 3. Testing
pnpm test # Run Vitest tests

# 4. Build & Package
pnpm build:main    # Production build (dist only)
pnpm package:local # Local testing package
```

### React DevTools

The renderer is served from the custom `app://renderer` origin, and Chromium
refuses to match extension content scripts against custom schemes, so the
React DevTools browser extension can never attach here, no matter how it is
installed. Use the standalone bridge instead:

```bash
pnpm react-devtools # standalone UI, listens on ws://localhost:8097
pnpm dev            # dev mode injects the bridge script automatically
```

The bridge script is only injected during dev (`vite serve`), and never in
production builds.

## Release channels

| Channel     | Description                      | Stability | Auto-Updates |
| ----------- | -------------------------------- | --------- | ------------ |
| **Stable**  | Thoroughly tested releases       | High      | Yes          |
| **Beta**    | Pre-release with new features    | Medium    | Yes          |
| **Nightly** | Daily builds with latest changes | Low       | Yes          |

## Technology stack

### Core framework

- **Electron** `37.1.0` - Cross-platform desktop framework
- **Node.js** `22+` - Backend runtime
- **TypeScript** `5.7+` - Type-safe development
- **Vite** `6.2+` - Build tooling

### Architecture and patterns

- **Dependency injection** - IoC container with decorator-based registration
- **Event-driven architecture** - IPC communication between processes
- **Module federation** - Dynamic controller and service loading
- **Observer pattern** - State management and UI synchronization

### Development tools

- **Vitest** - Unit testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **electron-builder** - Application packaging
- **electron-updater** - Auto-update mechanism

### Security and storage

- **Electron Safe Storage** - Encrypted token storage
- **OAuth 2.0 + PKCE** - Secure authentication flow
- **electron-store** - Persistent configuration
- **Custom protocol handler** - Secure callback handling

## Architecture

The desktop application uses a dependency injection and event-driven architecture:

### Core structure

```
src/main/core/
├── App.ts                    # Main application orchestrator
├── IoCContainer.ts           # Dependency injection container
├── window/                   # Window management modules
│   ├── WindowThemeManager.ts     # Theme synchronization
│   ├── WindowPositionManager.ts  # Position persistence
│   ├── WindowErrorHandler.ts     # Error boundaries
│   └── WindowConfigBuilder.ts    # Configuration builder
├── browser/                  # Browser management modules
│   ├── Browser.ts               # Individual window instances
│   └── BrowserManager.ts        # Multi-window coordinator
├── ui/                       # UI system modules
│   ├── Tray.ts                  # System tray integration
│   ├── TrayManager.ts           # Tray management
│   ├── MenuManager.ts           # Native menu system
│   └── ShortcutManager.ts       # Global shortcuts
└── infrastructure/           # Infrastructure services
    ├── StoreManager.ts          # Configuration storage
    ├── I18nManager.ts           # Internationalization
    ├── UpdaterManager.ts        # Auto-update system
    └── StaticFileServerManager.ts # Local file serving
```

### Application lifecycle

The `App.ts` class orchestrates the entire application lifecycle through key phases:

#### 1. Initialization phase

- **System information logging** - Captures OS, CPU, RAM, and locale details
- **Store manager setup** - Initializes persistent configuration storage
- **Dynamic module loading** - Auto-discovers controllers and services via glob imports
- **IPC event registration** - Sets up inter-process communication channels

#### 2. Bootstrap phase

- **Single instance check** - Ensures only one application instance runs
- **IPC server launch** - Starts the communication server
- **Core manager initialization** - Sequential initialization of all managers:
  - I18n for internationalization
  - Menu system for native menus
  - Static file server for local assets
  - Global shortcuts registration
  - Browser window management
  - System tray (Windows only)
  - Auto-updater system

### Core components deep dive

#### Browser management system

- **Multi-window architecture** - Supports chat, settings, and devtools windows
- **Window state management** - Handles positioning, theming, and lifecycle
- **WebContents mapping** - Bidirectional mapping between WebContents and identifiers
- **Event broadcasting** - Centralized event distribution to all or specific windows

#### Dependency injection and event system

- **IoC container** - WeakMap-based container for decorated controller methods
- **Typed IPC decorators** - `@IpcMethod` wires controller methods into type-safe channels
- **Automatic event mapping** - Events registered during controller loading
- **Service locator** - Type-safe service and controller retrieval

##### Type-safe IPC flow

- **Async context propagation** - `src/main/utils/ipc/base.ts` captures the `IpcContext` with `AsyncLocalStorage`, so controller logic can call `getIpcContext()` anywhere inside an IPC handler without explicitly threading arguments.
- **Service constructors registry** - `src/main/controllers/registry.ts` exports `controllerIpcConstructors` and `DesktopIpcServices`, enabling automatic typing of renderer IPC proxies.
- **Renderer proxy helper** - `src/utils/electron/ipc.ts` exposes `ensureElectronIpc()` which lazily builds a proxy on top of `window.electronAPI.invoke`, giving React/Next.js code a type-safe API surface without exposing raw proxies in preload.
- **Shared typings package** - `apps/desktop/src/main/exports.d.ts` augments `@azzar/electron-client-ipc` so every package can consume `DesktopIpcServices` without importing desktop business code directly.

#### Window management

- **Theme-aware windows** - Automatic adaptation to system dark/light mode
- **Platform-specific styling** - Windows title bar and overlay customization
- **Position persistence** - Save and restore window positions across sessions
- **Error boundaries** - Centralized error handling for window operations

#### Infrastructure services

##### I18n manager

- **18+ language support** with lazy loading and namespace organization
- **System integration** with Electron's locale detection
- **Dynamic UI refresh** on language changes
- **Resource management** with efficient loading strategies

##### Update manager

- **Multi-channel support** (stable, beta, nightly) with configurable intervals
- **Background downloads** with progress tracking and user notifications
- **Rollback protection** with error handling and recovery mechanisms
- **Channel management** with automatic channel switching

##### Store manager

- **Type-safe storage** using electron-store with TypeScript interfaces
- **Encrypted secrets** via Electron's Safe Storage API
- **Configuration validation** with default value management
- **File system integration** with automatic directory creation

##### Static file server

- **Local HTTP server** for serving application assets and user files
- **Security controls** with request filtering and access validation
- **File management** with upload, download, and deletion capabilities
- **Path resolution** with intelligent routing between storage locations

#### UI system integration

- **Global shortcuts** - Platform-aware keyboard shortcut registration with conflict detection
- **System tray** - Native integration with context menus and notifications
- **Native menus** - Platform-specific application and context menus with i18n
- **Theme synchronization** - Automatic theme updates across all UI components

### Controller and service architecture

#### Controller pattern

- **Typed IPC decorators** - Controllers extend `ControllerModule` and expose renderer methods via `@IpcMethod`
- **IPC event handling** - Processes events from renderer with decorator-based registration
- **Lifecycle hooks** - `beforeAppReady` and `afterAppReady` for initialization phases
- **Type-safe communication** - Strong typing for all IPC events and responses
- **Error boundaries** - Comprehensive error handling with proper propagation

#### Service pattern

- **Business logic encapsulation** - Clean separation of concerns
- **Dependency management** - Managed through IoC container
- **Cross-controller sharing** - Services accessible via service locator pattern
- **Resource management** - Proper initialization and cleanup

### Inter-process communication

#### IPC system features

- **Bidirectional communication** - Main to renderer and main to Next.js server
- **Type-safe events** - TypeScript interfaces for all event parameters
- **Context awareness** - Events include sender context for window-specific operations
- **Error propagation** - Centralized error handling with proper status codes

##### Renderer IPC helper

Renderer code uses a lightweight proxy generated at runtime to keep IPC calls type-safe without exposing raw Electron objects through `contextBridge`. Use the helper exported from `src/utils/electron/ipc.ts` to access the main-process services:

```ts
import { ensureElectronIpc } from '@/utils/electron/ipc';

const ipc = ensureElectronIpc();
await ipc.windows.openSettingsWindow({ tab: 'provider' });
```

The helper internally builds a proxy on top of `window.electronAPI.invoke`, so no proxy objects need to be cloned across the preload boundary.

#### Security features

- **OAuth 2.0 + PKCE** - Secure authentication with state parameter validation
- **Encrypted token storage** - Using Electron's Safe Storage API when available
- **Custom protocol handler** - Secure callback handling for OAuth flows
- **Request filtering** - Security controls for web requests and external links

## Testing

### Test structure

```bash
apps/desktop/src/main/controllers/__tests__/ # Controller unit tests
tests/                                       # Integration tests
```

### Running tests

```bash
pnpm test       # Run all tests
pnpm test:watch # Watch mode
pnpm type-check # Type validation
```

### Test coverage

- **Controller tests** - IPC event handling validation
- **Service tests** - Business logic verification
- **Integration tests** - End-to-end workflow testing
- **Type tests** - TypeScript interface validation

## Security features

### Authentication and authorization

- **OAuth 2.0 flow** with PKCE for secure token exchange
- **State parameter validation** to prevent CSRF attacks
- **Encrypted token storage** using platform-native secure storage
- **Automatic token refresh** with fallback to re-authentication

### Application security

- **Code signing** - macOS notarization for enhanced security
- **Sandboxing** - Controlled access to system resources
- **CSP controls** - Content Security Policy management
- **Request filtering** - Security controls for external requests

### Data protection

- **Encrypted configuration** - Sensitive data encrypted at rest
- **Secure IPC** - Type-safe communication channels
- **Path validation** - Secure file system access controls
- **Network security** - HTTPS enforcement and proxy support

## Contribution

Desktop application development involves complex cross-platform considerations and native integrations. We welcome contributions that improve functionality, performance, and user experience. You can participate in the following areas:

### How to contribute

1. **Platform support**: Enhance cross-platform compatibility and native integrations
2. **Performance optimization**: Improve application startup time, memory usage, and responsiveness
3. **Feature development**: Add new desktop-specific features and capabilities
4. **Bug fixes**: Fix platform-specific issues and edge cases
5. **Security improvements**: Enhance security measures and authentication flows
6. **UI/UX enhancements**: Improve desktop user interface and experience

### Contribution process

1. Clone the [AZZAR repository](https://github.com/hazemelerefey/azzar-agent) and create your branch
2. Set up the desktop development environment following the setup guide above
3. Make your changes to the desktop application
4. Submit a Pull Request describing:

- Platform compatibility testing results
- Performance impact analysis
- Security considerations
- User experience improvements
- Breaking changes (if any)

### Development areas

- **Core architecture**: Dependency injection, event system, and lifecycle management
- **Window management**: Multi-window support, theme synchronization, and state persistence
- **IPC communication**: Type-safe inter-process communication between main and renderer
- **Platform integration**: Native menus, shortcuts, notifications, and system tray
- **Security features**: OAuth flows, token encryption, and secure storage
- **Auto-update system**: Multi-channel updates and rollback mechanisms

## Additional resources

- **Development guide**: [`Development.md`](./Development.md) - Comprehensive development documentation
- **Architecture docs**: [`/docs`](../../docs/) - Detailed technical specifications
- **Contributing**: [`CONTRIBUTING.md`](../../CONTRIBUTING.md) - Contribution guidelines
- **Issues and support**: [GitHub Issues](https://github.com/hazemelerefey/azzar-agent/issues)
