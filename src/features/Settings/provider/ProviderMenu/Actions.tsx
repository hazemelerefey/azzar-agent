import { type DropdownItem } from '@azzar/ui';
import { ActionIcon, DropdownMenu } from '@azzar/ui';
import { MoreHorizontalIcon } from 'lucide-react';
import { memo } from 'react';

interface ActionsProps {
  dropdownMenu: DropdownItem[];
}

const Actions = memo<ActionsProps>(({ dropdownMenu }) => {
  return (
    <DropdownMenu items={dropdownMenu}>
      <ActionIcon icon={MoreHorizontalIcon} size={'small'} style={{ flex: 'none' }} />
    </DropdownMenu>
  );
});

export default Actions;
