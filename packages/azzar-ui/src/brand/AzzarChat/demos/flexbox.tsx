import { AzzarChat } from '@azzar/ui/brand';

import { Flexbox } from '../../../Flex';

export default () => (
  <Flexbox align={'flex-start'} gap={16}>
    <AzzarChat size={64} />
    <AzzarChat size={64} type={'mono'} />
    <AzzarChat size={64} type={'flat'} />
    <AzzarChat size={64} type={'text'} />
    <AzzarChat size={64} type={'combine'} />
    <AzzarChat extra={'Discover'} size={64} />
    <AzzarChat extra={'Discover'} size={64} type={'combine'} />
  </Flexbox>
);
