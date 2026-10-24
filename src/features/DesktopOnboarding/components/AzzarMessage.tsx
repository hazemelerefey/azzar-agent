import { type FlexboxProps } from '@azzar/ui';
import { Flexbox, Text } from '@azzar/ui';
import { type TypewriterEffectProps } from '@azzar/ui/awesome';
import { TypewriterEffect } from '@azzar/ui/awesome';
import { LoadingDots } from '@azzar/ui/chat';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ProductLogo } from '@/components/Branding';

interface AzzarMessageProps extends Omit<FlexboxProps, 'children'> {
  fontSize?: number;
  sentences: TypewriterEffectProps['sentences'];
}

const AzzarMessage = memo<AzzarMessageProps>(({ sentences, fontSize = 24, ...rest }) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  return (
    <Flexbox gap={8} {...rest}>
      <ProductLogo size={fontSize * 2} />
      <Text as={'h1'} fontSize={fontSize} weight={'bold'}>
        <TypewriterEffect
          cursorCharacter={<LoadingDots size={fontSize} variant={'pulse'} />}
          cursorFade={false}
          deletePauseDuration={1000}
          deletingSpeed={32}
          hideCursorWhileTyping={'afterTyping'}
          key={locale}
          pauseDuration={16_000}
          sentences={sentences}
          typingSpeed={64}
        />
      </Text>
    </Flexbox>
  );
});

export default AzzarMessage;
