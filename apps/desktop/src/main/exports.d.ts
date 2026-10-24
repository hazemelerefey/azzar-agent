import type { DesktopIpcServices } from './controllers/registry';

declare module '@azzar/electron-client-ipc' {
   
  interface DesktopIpcServicesMap extends DesktopIpcServices {}
}

export { type DesktopIpcServices } from './controllers/registry';
