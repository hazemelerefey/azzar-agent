'use client';

import type { BuiltinRenderProps } from '@azzar/types';
import { Flexbox } from '@azzar/ui';
import { CheckCircle, XCircle } from 'lucide-react';
import { memo } from 'react';

import type { ImportSkillParams, ImportSkillState } from '../../../types';

const ImportSkill = memo<BuiltinRenderProps<ImportSkillParams, ImportSkillState>>(
  ({ pluginState, content }) => {
    const { name, status, success } = pluginState || {};

    if (success === undefined) return null;

    if (!success) {
      return (
        <Flexbox horizontal align={'center'} gap={8} style={{ fontSize: 13 }}>
          <XCircle size={14} style={{ color: 'var(--azzar-error-6)' }} />
          <span style={{ fontWeight: 500 }}>
            Failed to import skill
            {content && (
              <>
                :{' '}
                <code
                  style={{
                    background: 'var(--azzar-fill-tertiary)',
                    borderRadius: 4,
                    color: 'var(--azzar-text)',
                    fontSize: 12,
                    padding: '2px 6px',
                  }}
                >
                  {content}
                </code>
              </>
            )}
          </span>
        </Flexbox>
      );
    }

    const statusLabel =
      status === 'created' ? 'Imported' : status === 'updated' ? 'Updated' : 'Already up to date';

    return (
      <Flexbox horizontal align={'center'} gap={8} style={{ fontSize: 13 }}>
        <CheckCircle size={14} style={{ color: 'var(--azzar-success-6)' }} />
        <span style={{ fontWeight: 500 }}>
          {statusLabel}:{' '}
          <code
            style={{
              background: 'var(--azzar-fill-tertiary)',
              borderRadius: 4,
              color: 'var(--azzar-text)',
              fontSize: 12,
              padding: '2px 6px',
            }}
          >
            {name}
          </code>
        </span>
      </Flexbox>
    );
  },
);

export default ImportSkill;
