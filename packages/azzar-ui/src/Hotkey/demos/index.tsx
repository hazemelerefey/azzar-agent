import { Hotkey, type HotkeyProps } from '@azzar/ui';
import { StoryBook, useControls, useCreateStore } from '@azzar/ui/storybook';

export default () => {
  const store = useCreateStore();
  const control = useControls(
    {
      compact: false,
      inverseTheme: false,
      keys: 'mod+k',
      variant: {
        options: ['filled', 'outlined', 'borderless'],
        value: 'filled',
      },
    },
    { store },
  ) as HotkeyProps;

  return (
    <StoryBook levaStore={store}>
      <Hotkey {...control} />
    </StoryBook>
  );
};
