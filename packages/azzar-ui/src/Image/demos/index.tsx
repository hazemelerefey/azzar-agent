import { Image, type ImageProps } from '@azzar/ui';
import { StoryBook, useControls, useCreateStore } from '@azzar/ui/storybook';

export default () => {
  const store = useCreateStore();
  const options = useControls(
    {
      alt: 'Image',
      preview: true,
      src: 'https://hazemelerefy.tech/emoji-assets/3d/assets/1f5bc-fe0f.webp',
      variant: {
        options: ['filled', 'outlined', 'borderless'],
        value: 'filled',
      },
    },
    { store },
  ) as ImageProps;
  return (
    <StoryBook levaStore={store}>
      <Image {...options} />
    </StoryBook>
  );
};
