import { Center, cssVar } from '@azzar/ui';
import { LoadingDots } from '@azzar/ui/chat';

const BubblesLoading = () => {
  return (
    <Center style={{ height: 24, width: 32 }}>
      <LoadingDots color={cssVar.colorTextSecondary} size={12} variant={'pulse'} />
    </Center>
  );
};

export default BubblesLoading;
