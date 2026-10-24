import { Tooltip, type TooltipProps } from '@azzar/ui';
import { Button } from '@azzar/ui';
import { StoryBook, useControls, useCreateStore } from '@azzar/ui/storybook';

export default () => {
  const store = useCreateStore();
  const control = useControls(
    {
      arrow: false,
      hotkey: 'mod+k',
      title: 'Example tooltip',
    },
    { store },
  ) as TooltipProps;

  return (
    <StoryBook levaStore={store}>
      <Tooltip {...control}>
        <Button type="primary">Tooltip</Button>
      </Tooltip>
    </StoryBook>
  );
};
