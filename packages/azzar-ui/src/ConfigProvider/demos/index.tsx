import { ConfigProvider } from '@azzar/ui';
import { AZZAR } from '@azzar/ui/brand';
import { motion } from 'motion/react';

export default () => {
  return (
    <ConfigProvider config={{ proxy: 'unpkg' }} motion={motion}>
      <AZZAR />
    </ConfigProvider>
  );
};
