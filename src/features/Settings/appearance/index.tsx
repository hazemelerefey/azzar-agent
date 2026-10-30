import { useTranslation } from 'react-i18next';

import SettingHeader from '@/features/Settings/features/SettingHeader';

import ChatAppearance from '../chat-appearance/features/ChatAppearance';
import Appearance from '../common/features/Appearance';
import Common from '../common/features/Common/Common';
import Desktop from './features/Desktop';
import Font from './features/Font';
import WorkbenchMode from './features/WorkbenchMode';

interface PageProps {
  showSettingHeader?: boolean;
}

const Page = ({ showSettingHeader = true }: PageProps) => {
  const { t } = useTranslation('setting');
  return (
    <>
      {showSettingHeader && <SettingHeader title={t('tab.appearance')} />}
      <WorkbenchMode />
      <Common />
      <Appearance />
      <Desktop />
      <Font />
      <ChatAppearance />
    </>
  );
};

export default Page;
