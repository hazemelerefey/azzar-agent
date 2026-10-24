import { type DropdownItem } from '@azzar/ui';
import { ActionIcon, DropdownMenu } from '@azzar/ui';
import { MoreHorizontalIcon } from 'lucide-react';
import { memo } from 'react';

interface ActionsProps {
  dropdownMenu: DropdownItem[];
  isLoading?: boolean;
}

const Actions = memo<ActionsProps>(({ dropdownMenu, isLoading }) => {
  return (
    <DropdownMenu items={dropdownMenu}>
      <ActionIcon
        icon={MoreHorizontalIcon}
        loading={isLoading}
        size={'small'}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
    </DropdownMenu>
  );
});

export default Actions;
