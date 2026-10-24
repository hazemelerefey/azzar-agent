import { GradientButton, type GradientButtonProps } from '@azzar/ui/awesome';
import { StoryBook, useControls, useCreateStore } from '@azzar/ui/storybook';

export default () => {
  const store = useCreateStore();
  const control = useControls(
    {
      children: 'Get a Demo',
      glow: true,
      size: {
        options: ['large', 'normal', 'small'],
        value: 'large',
      },
    },
    { store },
  ) as GradientButtonProps;

  return (
    <StoryBook levaStore={store}>
      <GradientButton {...control} />
    </StoryBook>
  );
};
