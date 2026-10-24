import { ConfigProvider } from '@azzar/ui';
import { AZZAR } from '@azzar/ui/brand';
import { motion } from 'motion/react';

export default () => {
  return (
    <ConfigProvider
      enableCustomFonts={false}
      motion={motion}
      config={{
        customCdnFn: ({ pkg, version = 'latest', path }) =>
          `https://yourcdn/${pkg}/${version}/${path}`,
        proxy: 'custom',
      }}
    >
      <AZZAR />
    </ConfigProvider>
  );
};
