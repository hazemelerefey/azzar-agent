import { Button, DropdownMenu } from '@azzar/ui';

import { groupItems } from './data';

export default () => {
  return (
    <DropdownMenu nativeButton items={groupItems}>
      <Button>Group Items</Button>
    </DropdownMenu>
  );
};
