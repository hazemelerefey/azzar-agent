import { ImageSelect } from '@azzar/ui';
import { useState } from 'react';

export default () => {
  const [active, setActive] = useState('a');
  return (
    <ImageSelect
      height={86}
      value={active}
      width={86}
      options={[
        {
          img: `https://registry.npmmirror.com/@azzar/assets-emoji/1.3.0/files/assets/robot.webp`,
          label: 'A',
          value: 'a',
        },
        {
          img: `https://registry.npmmirror.com/@azzar/assets-emoji/1.3.0/files/assets/convenience-store.webp`,
          label: 'B',
          value: 'b',
        },
      ]}
      onChange={setActive}
    />
  );
};
