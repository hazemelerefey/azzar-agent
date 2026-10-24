import { AZZAR } from '@azzar/ui/brand';

import { Flexbox } from '../../../Flex';

export default () => (
  <Flexbox align={'flex-start'} gap={16}>
    <AZZAR size={64} />
    <AZZAR size={64} type={'mono'} />
    <AZZAR size={64} type={'flat'} />
    <AZZAR size={64} type={'text'} />
    <AZZAR size={64} type={'combine'} />
    <AZZAR extra={'Discover'} size={64} />
    <AZZAR extra={'Discover'} size={64} type={'combine'} />
  </Flexbox>
);
