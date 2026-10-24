import { GuideCard, type GuideCardProps } from '@azzar/ui';
import { StoryBook, useControls, useCreateStore } from '@azzar/ui/storybook';

export default () => {
  const store = useCreateStore();
  const control = useControls(
    {
      closable: true,
      cover:
        'https://registry.npmmirror.com/@azzar/assets-emoji/1.3.0/files/assets/convenience-store.webp',
      desc: 'Description',
      shadow: false,
      title: 'Title',
      variant: {
        options: ['filled', 'outlined', 'borderless'],
        value: 'filled',
      },
      width: 200,
    },
    { store },
  ) as GuideCardProps;

  return (
    <StoryBook levaStore={store}>
      <GuideCard {...control} />
    </StoryBook>
  );
};
