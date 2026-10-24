import { type EmojiPickerProps } from '@azzar/ui';
import { Skeleton } from '@azzar/ui';
import { lazy, memo, Suspense } from 'react';

import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';

// @azzar/ui's EmojiPicker bundles the emoji-mart dataset (~600 KB); load it
// on mount so the picker never sits inside a route's static closure.
const AzzarEmojiPicker = lazy(() => import('@azzar/ui/es/EmojiPicker/index'));

export const EmojiPicker = memo<EmojiPickerProps>(({ shape = 'square', ...rest }) => {
  const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);
  const size = rest.size ?? 40;

  return (
    <Suspense fallback={<Skeleton height={size} width={size} />}>
      <AzzarEmojiPicker shape={shape} {...rest} defaultAvatar={null as any} locale={locale} />
    </Suspense>
  );
});

export default EmojiPicker;
