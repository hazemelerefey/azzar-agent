'use client';

import { createSearchLocalFilesInspector } from '@azzar/shared-tool-ui/inspectors';

export const SearchLocalFilesInspector = createSearchLocalFilesInspector({
  noResultsKey: 'builtins.azzar-local-system.inspector.noResults',
  translationKey: 'builtins.azzar-local-system.apiName.searchLocalFiles',
});
