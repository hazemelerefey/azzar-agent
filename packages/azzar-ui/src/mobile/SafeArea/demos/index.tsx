import { SafeArea } from '@azzar/ui/mobile';

import { Flexbox } from '../../../Flex';

export default () => {
  return (
    <Flexbox>
      <SafeArea position="top" style={{ background: 'green' }} />
      <Flexbox flex={1} />
      <SafeArea position="bottom" style={{ background: 'blue' }} />
    </Flexbox>
  );
};
