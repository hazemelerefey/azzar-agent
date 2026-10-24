'use client';

import { createSearchLocalFilesInspector } from '@azzar/shared-tool-ui/inspectors';

export const SearchLocalFilesInspector = createSearchLocalFilesInspector({
  noResultsKey: 'builtins.azzar-cloud-sandbox.inspector.noResults',
  translationKey: 'builtins.azzar-cloud-sandbox.apiName.searchLocalFiles',
});
