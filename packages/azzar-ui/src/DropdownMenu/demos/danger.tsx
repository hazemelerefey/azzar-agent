import { Button, DropdownMenu } from '@azzar/ui';

import { dangerItems } from './data';

export default () => {
  return (
    <DropdownMenu nativeButton items={dangerItems}>
      <Button danger>Danger Items</Button>
    </DropdownMenu>
  );
};
