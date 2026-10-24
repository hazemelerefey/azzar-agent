import { Line } from '@azzar/ui/icons';

import { Flexbox } from '../../../Flex';

export default () => (
  <Flexbox horizontal gap={16}>
    <Line.Avatar size={64} />
    <Line.Avatar shape={'square'} size={64} />
  </Flexbox>
);
