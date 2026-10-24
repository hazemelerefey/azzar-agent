import { BRANDING_NAME } from '@azzar/business-const';
import type { MarkdownProps } from '@azzar/ui';
import { Center, Markdown } from '@azzar/ui';
import { useTranslation } from 'react-i18next';

const ChatPreview = ({ fontSize }: Pick<MarkdownProps, 'fontSize'>) => {
  const { t } = useTranslation('welcome');
  return (
    <Center>
      <Markdown fontSize={fontSize} variant={'chat'}>
        {t('guide.defaultMessageWithoutCreate', {
          appName: BRANDING_NAME,
        })}
      </Markdown>
    </Center>
  );
};

export default ChatPreview;
