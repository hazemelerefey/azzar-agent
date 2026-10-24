import { TypewriterEffect } from '@azzar/ui/awesome';

import { Flexbox } from '../../../Flex';

export default () => {
  return (
    <Flexbox gap={16}>
      <TypewriterEffect
        sentences={[
          '👋 Hello World!',
          '🎉 Emoji support 🚀',
          '👨‍👩‍👧‍👦 Family emoji works!',
          '👍🏻 Skin tone emoji 🙌🏽',
          '🏳️‍🌈 Flag sequences 🏴‍☠️',
          '😀😃😄😁 Multiple emojis!',
        ]}
      />
    </Flexbox>
  );
};
