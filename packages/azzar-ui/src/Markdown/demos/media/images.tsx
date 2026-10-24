import { Markdown, type MarkdownProps } from '@azzar/ui';
import { StoryBook, useControls, useCreateStore } from '@azzar/ui/storybook';

const imagesContent = `![shields](https://img.shields.io/badge/AZZAR-Readme%20Generator-white?labelColor=black&style=flat-square)

![Gallery Image](https://github.com/user-attachments/assets/2428a136-38bf-488c-8033-d9f261d67f3d)

`;

export default () => {
  const store = useCreateStore();
  const options = useControls(
    {
      children: {
        rows: true,
        value: imagesContent,
      },
    },
    { store },
  ) as MarkdownProps;
  return (
    <StoryBook levaStore={store}>
      <Markdown {...options} />
    </StoryBook>
  );
};
