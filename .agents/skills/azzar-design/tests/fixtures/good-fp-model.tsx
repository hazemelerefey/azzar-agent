// GOOD fixture (false-positive regression): monospace via a cssVar ternary; it must not trip AZZAR-FONT-FAMILY.
'use client';

import { ModelIcon } from '@azzar/icons';
import { Flexbox } from '@azzar/ui';
import { cssVar } from '@azzar/ui';
import { memo } from 'react';

interface ModelInTableProps {
  /** Render the id in monospace, matching identifier columns. */
  code?: boolean;
  model?: string | null;
}

const ModelInTable = memo<ModelInTableProps>(({ code = true, model }) => {
  if (!model) return '--';

  return (
    <Flexbox horizontal align={'center'} gap={6} style={{ maxWidth: '100%', minWidth: 0 }}>
      <ModelIcon model={model} size={18} style={{ flexShrink: 0 }} type={'avatar'} />
      <span
        style={{
          fontFamily: code ? cssVar.fontFamilyCode : undefined,
          fontSize: code ? 12 : undefined,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {model}
      </span>
    </Flexbox>
  );
});

ModelInTable.displayName = 'ModelInTable';

export default ModelInTable;
