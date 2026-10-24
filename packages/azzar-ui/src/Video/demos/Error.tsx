import { Video } from '@azzar/ui';

export default () => (
  <Video
    maxHeight={240}
    src="https://example.invalid/missing.mp4"
    onRetry={() => new Promise((resolve) => setTimeout(resolve, 300))}
  />
);
