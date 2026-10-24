import { Flexbox, Skeleton } from '@azzar/ui';

const Loading = () => {
  return (
    <Flexbox>
      <Skeleton.Text rows={8} />
    </Flexbox>
  );
};

export default Loading;
