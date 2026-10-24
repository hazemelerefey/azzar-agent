import { ActionIcon, Image } from '@azzar/ui';
import { Trash } from 'lucide-react';

export default () => {
  return (
    <Image
      actions={<ActionIcon danger glass icon={Trash} variant={'filled'} />}
      src={
        'https://hazemelerefy.tech/emoji-assets/3d/assets/1f5bc-fe0f.webp'
      }
    />
  );
};
