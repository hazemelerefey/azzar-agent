# @azzar/electron-server-ipc

IPC (Inter-Process Communication) module between AZZAR's Electron application and server. It provides reliable cross-process communication between the two.

## Introduction

`@azzar/electron-server-ipc` is a core component of AZZAR's desktop application. It handles communication between the Electron main process and the Next.js server, with a simple and robust API for passing data and executing remote method calls across processes.

## Core features

- **Reliable IPC communication**: socket-based mechanism for stable cross-process communication
- **Automatic reconnection**: the client reconnects on its own, which keeps the application stable
- **Type safety**: complete TypeScript definitions, so API calls are type-checked
- **Cross-platform support**: Windows, macOS, and Linux

## Core components

### IPC server (ElectronIPCServer)

Listens for client requests and responds. It runs in Electron's main process:

```typescript
import { ElectronIPCEventHandler, ElectronIPCServer } from '@azzar/electron-server-ipc';

// Define handler functions
const eventHandler: ElectronIPCEventHandler = {
  getDatabasePath: async () => {
    return '/path/to/database';
  },
  // Other handler functions...
};

// Create and start server
const server = new ElectronIPCServer(eventHandler);
server.start();
```

### IPC client (ElectronIpcClient)

Connects to the server and sends requests. It runs in the server process (such as the Next.js service):

```typescript
import { ElectronIPCMethods, ElectronIpcClient } from '@azzar/electron-server-ipc';

// Create client
const client = new ElectronIpcClient();

// Send request
const dbPath = await client.sendRequest(ElectronIPCMethods.getDatabasePath);
```

## Contribution

IPC server implementations need to handle many communication scenarios and edge cases. Contributions that improve reliability and functionality are welcome:

1. **Performance optimization**: faster, more reliable IPC communication
2. **Error handling**: better error recovery and reconnection
3. **New features**: new IPC methods or communication patterns
4. **Documentation**: clearer code documentation and usage examples

To contribute, clone the [AZZAR repository](https://github.com/hazemelerefey/azzar-agent), make the change, and submit a pull request describing the improvements, the testing methodology and results, compatibility considerations, and usage examples.

## Note

This is an internal module of AZZAR (`"private": true`), built for AZZAR desktop applications and not published as a standalone package.
