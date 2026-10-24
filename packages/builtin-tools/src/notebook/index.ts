import { type BuiltinRender } from '@azzar/types';

import CreateDocumentRender from './CreateDocumentRender';

export const NotebookIdentifier = 'azzar-notebook';

export const NotebookApiName = {
  createDocument: 'createDocument',
} as const;

export const NotebookRenders: Record<string, BuiltinRender> = {
  [NotebookApiName.createDocument]: CreateDocumentRender as BuiltinRender,
};
