import type { ItemType } from '@azzar/ui';

export interface DocumentTransferMenuItemOptions {
  defaultTargetVisibility?: 'private' | 'public';
  preferCurrentWorkspace?: boolean;
  transferLabel?: string;
}

export const useDocumentTransferMenuItem = (
  _documentId?: string,
  _options?: DocumentTransferMenuItemOptions,
): ItemType[] | null => null;
