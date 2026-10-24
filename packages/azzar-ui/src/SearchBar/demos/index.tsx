import { SearchBar, type SearchBarProps } from '@azzar/ui';
import { StoryBook, useControls, useCreateStore } from '@azzar/ui/storybook';

export default () => {
  const store = useCreateStore();
  const controls = useControls(
    {
      enableShortKey: true,
      loading: false,
      placeholder: 'Type keywords...',
      shadow: false,
      shortKey: 'f',
      spotlight: false,
      variant: {
        options: ['outlined', 'borderless', 'filled'],
        value: 'filled',
      },
    },
    { store },
  ) as SearchBarProps;

  return (
    <StoryBook levaStore={store}>
      <SearchBar {...controls} />
    </StoryBook>
  );
};
