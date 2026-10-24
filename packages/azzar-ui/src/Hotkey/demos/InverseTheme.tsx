import { cssVar, Hotkey } from '@azzar/ui';

import { Center } from '../../Flex';

export default () => {
  return (
    <Center height={240} style={{ background: cssVar.colorText }} width={'100%'}>
      <Hotkey inverseTheme keys={'mod+comma'} />
    </Center>
  );
};
