'use client';

import type { BuiltinRenderProps } from '@azzar/types';
import { Empty, Flexbox } from '@azzar/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { SearchKnowledgeBaseArgs, SearchKnowledgeBaseState } from '../../../types';
import FileItem from './Item';

const SearchKnowledgeBase = memo<
  BuiltinRenderProps<SearchKnowledgeBaseArgs, SearchKnowledgeBaseState>
>(({ pluginState }) => {
  const { t } = useTranslation('plugin');
  const { fileResults, scope } = pluginState || {};

  // Nothing was searched — saying "No results" would read as "the files don't
  // contain it" when the agent simply has no library to look in.
  if (scope === 'none') {
    return <Empty description={t('builtins.azzar-knowledge-base.render.noScope')} />;
  }

  if (!fileResults || fileResults.length === 0) {
    return <Empty description={t('builtins.azzar-knowledge-base.inspector.noResults')} />;
  }

  return (
    <Flexbox horizontal gap={8} wrap={'wrap'}>
      {fileResults.map((file, index) => {
        return <FileItem index={index} key={file.fileId} {...file} />;
      })}
    </Flexbox>
  );
});

export default SearchKnowledgeBase;
