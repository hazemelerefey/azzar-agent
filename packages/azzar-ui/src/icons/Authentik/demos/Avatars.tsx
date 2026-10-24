import { Authentik } from '@azzar/ui/icons';

import { Flexbox } from '../../../Flex';

export default () => (
  <Flexbox horizontal gap={16}>
    <Authentik.Avatar size={64} />
    <Authentik.Avatar shape={'square'} size={64} />
  </Flexbox>
);
