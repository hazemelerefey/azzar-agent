import { TypewriterEffect } from '@azzar/ui/awesome';

import { Flexbox } from '../../../Flex';

export default () => {
  return (
    <Flexbox gap={16}>
      <div>
        <div style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>
          Grapheme Mode (Character by Character)
        </div>
        <TypewriterEffect
          segmentMode="grapheme"
          sentences={['Hello World! 你好世界！ 👋🌍']}
          typingSpeed={100}
        />
      </div>
      <div>
        <div style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>Word Mode (Word by Word)</div>
        <TypewriterEffect
          segmentMode="word"
          sentences={['Hello World! 你好世界！ 👋🌍']}
          typingSpeed={200}
        />
      </div>
    </Flexbox>
  );
};
