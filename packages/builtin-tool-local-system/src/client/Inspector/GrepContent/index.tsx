'use client';

import { createGrepContentInspector } from '@azzar/shared-tool-ui/inspectors';

export const GrepContentInspector = createGrepContentInspector({
  noResultsKey: 'builtins.azzar-local-system.inspector.noResults',
  translationKey: 'builtins.azzar-local-system.apiName.grepContent',
});
