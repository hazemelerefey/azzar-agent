'use client';

import { type DropdownItem } from '@azzar/ui';
import { ActionIcon, DropdownMenu } from '@azzar/ui';
import { MoreHorizontal } from 'lucide-react';
import { memo } from 'react';

import { useDropdownMenu } from './useDropdownMenu';

const Actions = memo(() => {
  const items: DropdownItem[] = useDropdownMenu();

  return (
    <DropdownMenu items={items}>
      <ActionIcon icon={MoreHorizontal} size={'small'} />
    </DropdownMenu>
  );
});

export default Actions;
