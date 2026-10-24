import { Icon, type IconProps } from '@azzar/ui';
import { StoryBook, useControls, useCreateStore } from '@azzar/ui/storybook';
import * as LucideIcon from 'lucide-react';

export default () => {
  const store = useCreateStore();
  const control = useControls(
    {
      icon: {
        options: LucideIcon,
        value: LucideIcon.Settings,
      },
      size: {
        options: ['large', 'middle', 'small'],
        value: 'middle',
      },
      spin: false,
    },
    { store },
  ) as IconProps;

  return (
    <StoryBook levaStore={store}>
      <Icon {...control} />
    </StoryBook>
  );
};
