import type { ItemType } from '@azzar/ui';
import { ActionIcon, DropdownMenu as DropdownMenuUI } from '@azzar/ui';
import { MoreHorizontalIcon } from 'lucide-react';
import { memo } from 'react';

interface DropdownMenuProps {
  className?: string;
  items: ItemType[] | (() => ItemType[]);
}

const DropdownMenu = memo<DropdownMenuProps>(({ items, className }) => {
  return (
    <DropdownMenuUI items={items}>
      <ActionIcon className={className} icon={MoreHorizontalIcon} size={'small'} />
    </DropdownMenuUI>
  );
});

export default DropdownMenu;
