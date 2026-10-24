# @azzar/electron-client-ipc

Client-side toolkit for IPC (Inter-Process Communication) in AZZAR's Electron environment.

## Introduction

In Electron applications, IPC is the bridge between the Main Process, the Renderer Process, and the Next.js Process. To keep these communications organized, the IPC code is split into two packages:

- `@azzar/electron-client-ipc`: **client-side IPC package** (this package)
- `@azzar/electron-server-ipc`: **server-side IPC package**

## Key differences

### electron-client-ipc (this package)

- Runtime environment: the Renderer Process
- Responsibilities:
  - Interface definitions for the renderer process to call main process methods
  - Encapsulates `ipcRenderer.invoke` related methods
  - Handles communication requests with the main process

### electron-server-ipc

- Runtime environment: the Electron main process and the Next.js server process
- Responsibilities:
  - Socket-based IPC communication mechanism
  - Server-side (`ElectronIPCServer`) and client-side (`ElectronIpcClient`) communication components
  - Cross-process requests and responses
  - Automatic reconnection and error handling
  - Type-safe API calls

## Use cases

When the renderer process needs to access system APIs, perform file operations, or call main process functions, it goes through the methods this package provides.

## Technical notes

The split follows separation of concerns:

- IPC communication interfaces stay clear and maintainable
- Client-side and server-side code are decoupled
- TypeScript type definitions are shared, so calls stay type-safe

## Contribution

IPC communication needs vary across use cases and platforms. Contributions that improve or extend the IPC functionality are welcome:

1. **Bug reports**: issues with IPC communication or type definitions
2. **Feature requests**: new IPC methods or interface improvements
3. **Code contributions**: bug fixes or new features

To contribute, clone the [AZZAR repository](https://github.com/hazemelerefey/azzar-agent), make the change, and submit a pull request describing the problem, the implementation, the test cases or usage examples, and the impact on existing functionality.

## Note

This is an internal module of AZZAR (`"private": true`), built for AZZAR and not published as a standalone package.
